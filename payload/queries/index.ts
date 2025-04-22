import { RequiredDataFromCollectionSlug } from 'payload';
import { getPayload } from '../utils';
import { genSaltSync, hashSync } from 'bcrypt-ts';

export async function getUser(email: string) {
  const payload = await getPayload();
  const { docs: users } = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    sort: '-createdAt',
    depth: 0,
    pagination: false,
  });
  return users;
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  const payload = await getPayload();
  const user = await payload.create({
    collection: 'users',
    data: { email, password: hash },
  });
  return user;
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  const payload = await getPayload();
  const chat = await payload.create({
    collection: 'chats',
    data: { id, userId, title },
  });
  return chat;
}

export async function deleteChatById({ id }: { id: string }) {
  const payload = await getPayload();

  await payload.delete({
    collection: 'chat-votes',
    where: { chatId: { equals: id } },
  });
  await payload.delete({
    collection: 'chat-messages',
    where: { chatId: { equals: id } },
  });
  await payload.delete({ collection: 'chats', id });
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  const payload = await getPayload();
  const { docs: chats } = await payload.find({
    collection: 'chats',
    where: {
      userId: { equals: id },
      createdAt: {
        greater_than: startingAfter,
        less_than: endingBefore,
      },
    },
    sort: '-createdAt',
    depth: 0,
    pagination: false,
    limit,
  });
  return chats;
}

export async function getChatById({ id }: { id: string }) {
  try {
    const payload = await getPayload();
    const chat = await payload.findByID({ collection: 'chats', id, depth: 0 });
    return chat;
  } catch (error) {
    return null;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<RequiredDataFromCollectionSlug<'chat-messages'>>;
}) {
  const payload = await getPayload();
  const results = [];
  for (const message of messages) {
    const result = await payload.create({
      collection: 'chat-messages',
      data: message,
    });
    results.push(result);
  }
  return results;
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const payload = await getPayload();
  const { docs: messages } = await payload.find({
    collection: 'chat-messages',
    where: { chatId: { equals: id } },
    sort: 'createdAt',
    depth: 0,
    pagination: false,
  });
  return messages;
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  const payload = await getPayload();
  const vote = await payload.create({
    collection: 'chat-votes',
    data: { chatId, messageId, isUpvoted: type === 'up' },
  });
  return vote;
}

export async function getVotesByChatId({ id }: { id: string }) {
  const payload = await getPayload();
  const { docs: votes } = await payload.find({
    collection: 'chat-votes',
    where: { chatId: { equals: id } },
    sort: '-createdAt',
    depth: 0,
    pagination: false,
  });
  return votes;
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: 'text' | 'image' | 'code' | 'sheet';
  content: string;
  userId: string;
}) {
  const payload = await getPayload();
  const document = await payload.create({
    collection: 'chat-documents',
    data: { documentId: id, title, kind, content, userId },
  });
  return document;
}

export async function getDocumentsByChatId({ id }: { id: string }) {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: 'chat-documents',
    where: { chatId: { equals: id } },
    sort: '-createdAt',
    depth: 0,
    pagination: false,
  });
  return docs;
}

export async function getDocumentsById({ id }: { id: string }) {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: 'chat-documents',
    where: {
      documentId: { equals: id },
    },
    sort: 'createdAt',
    depth: 0,
    pagination: false,
  });
  return docs;
}

export async function getDocumentById({ id }: { id: string }) {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: 'chat-documents',
    where: {
      documentId: { equals: id },
    },
    sort: '-createdAt',
    limit: 1,
  });
  return docs[0];
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  const payload = await getPayload();

  await payload.delete({
    collection: 'chat-suggestions',
    where: {
      'documentId.documentId': { equals: id },
      'documentId.createdAt': { greater_than: timestamp },
    },
  });

  await payload.delete({
    collection: 'chat-documents',
    where: {
      documentId: { equals: id },
      createdAt: { greater_than: timestamp },
    },
  });
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<RequiredDataFromCollectionSlug<'chat-suggestions'>>;
}) {
  const payload = await getPayload();
  const results = [];
  for (const suggestion of suggestions) {
    const result = await payload.create({
      collection: 'chat-suggestions',
      data: suggestion,
    });
    results.push(result);
  }
  return results;
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: 'chat-suggestions',
    where: { 'documentId.documentId': { equals: documentId } },
    sort: '-createdAt',
    depth: 0,
    pagination: false,
  });
  return docs;
}

export async function getMessageById({ id }: { id: string }) {
  const payload = await getPayload();
  const message = await payload.findByID({
    collection: 'chat-messages',
    id,
  });
  return message;
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  const payload = await getPayload();

  const { docs: messagesToDelete } = await payload.find({
    collection: 'chat-messages',
    where: {
      chatId: { equals: chatId },
      createdAt: { greater_than: timestamp },
    },
    sort: '-createdAt',
    depth: 0,
    pagination: false,
  });

  const messageIds = messagesToDelete.map((message) => message.id);

  if (messageIds.length > 0) {
    await payload.delete({
      collection: 'chat-votes',
      where: { messageId: { in: messageIds } },
    });

    return await payload.delete({
      collection: 'chat-messages',
      where: { id: { in: messageIds } },
    });
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  const payload = await getPayload();
  await payload.update({
    collection: 'chats',
    id: chatId,
    data: { visibility },
  });
}
