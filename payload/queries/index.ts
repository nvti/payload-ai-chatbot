import { RequiredDataFromCollectionSlug } from 'payload';
import { getPayload } from '../utils';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import { generateUUID } from '@/lib/utils';
import { ChatSDKError } from '@/lib/errors';

export async function getUser(email: string) {
  try {
    const payload = await getPayload();
    const { docs: users } = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      sort: '-createdAt',
      depth: 0,
      pagination: false,
    });
    return users;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    const payload = await getPayload();
    const user = await payload.create({
      collection: 'users',
      data: { email, password: hash },
    });
    return user;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}@guest.local`;
  const salt = genSaltSync(10);
  const hash = hashSync(generateUUID(), salt);

  try {
    const payload = await getPayload();
    const user = await payload.create({
      collection: 'users',
      data: { email, password: hash },
    });
    return user;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create guest user',
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: 'private' | 'public';
}) {
  try {
    const payload = await getPayload();
    const chat = await payload.create({
      collection: 'chats',
      data: { id, userId, title, visibility },
    });
    return chat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  const payload = await getPayload();
  const transactionId = await payload.db.beginTransaction();
  if (!transactionId) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to begin transaction',
    );
  }

  try {
    await payload.delete({
      collection: 'chat-votes',
      where: { chatId: { equals: id } },
    });
    await payload.delete({
      collection: 'chat-messages',
      where: { chatId: { equals: id } },
    });
    await payload.delete({ collection: 'chats', id });

    await payload.db.commitTransaction(transactionId);
  } catch (error) {
    await payload.db.rollbackTransaction(transactionId);
    throw new ChatSDKError('bad_request:database', 'Failed to delete chat');
  }
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

  let startingAfterDate: string | undefined = undefined;
  let endingBeforeDate: string | undefined = undefined;

  if (startingAfter) {
    try {
      const result = await payload.findByID({
        collection: 'chats',
        id: startingAfter,
      });
      startingAfterDate = result.createdAt;
    } catch (error) {
      throw new ChatSDKError(
        'not_found:database',
        `Chat with id ${startingAfter} not found`,
      );
    }
  }

  if (endingBefore) {
    try {
      const result = await payload.findByID({
        collection: 'chats',
        id: endingBefore,
      });
      endingBeforeDate = result.createdAt;
    } catch (error) {
      throw new ChatSDKError(
        'not_found:database',
        `Chat with id ${endingBefore} not found`,
      );
    }
  }
  const extendedLimit = limit + 1;

  try {
    const { docs: chats } = await payload.find({
      collection: 'chats',
      where: {
        userId: { equals: id },
        createdAt: {
          greater_than: startingAfterDate,
          less_than: endingBeforeDate,
        },
      },
      sort: '-createdAt',
      depth: 0,
      pagination: false,
      limit: extendedLimit,
    });

    const hasMore = chats.length > limit;
    return {
      chats: hasMore ? chats.slice(0, limit) : chats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const payload = await getPayload();
    const chat = await payload.findByID({ collection: 'chats', id, depth: 0 });
    return chat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<RequiredDataFromCollectionSlug<'chat-messages'>>;
}) {
  const payload = await getPayload();
  const results = [];

  try {
    for (const message of messages) {
      const result = await payload.create({
        collection: 'chat-messages',
        data: message,
      });
      results.push(result);
    }
    return results;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  const payload = await getPayload();

  const twentyFourHoursAgo = new Date(
    Date.now() - differenceInHours * 60 * 60 * 1000,
  );

  const { totalDocs } = await payload.count({
    collection: 'chat-messages',
    where: {
      userId: { equals: id },
      role: { equals: 'user' },
      createdAt: { greater_than: twentyFourHoursAgo },
    },
  });

  return totalDocs ?? 0;
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const payload = await getPayload();
  try {
    const { docs: messages } = await payload.find({
      collection: 'chat-messages',
      where: { chatId: { equals: id } },
      sort: 'createdAt',
      depth: 0,
      pagination: false,
    });
    return messages;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
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
  try {
    const vote = await payload.create({
      collection: 'chat-votes',
      data: { chatId, messageId, isUpvoted: type === 'up' },
    });
    return vote;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  const payload = await getPayload();
  try {
    const { docs: votes } = await payload.find({
      collection: 'chat-votes',
      where: { chatId: { equals: id } },
      sort: '-createdAt',
      depth: 0,
      pagination: false,
    });
    return votes;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
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
  try {
    const document = await payload.create({
      collection: 'chat-documents',
      data: { documentId: id, title, kind, content, userId },
    });
    return document;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsByChatId({ id }: { id: string }) {
  const payload = await getPayload();
  try {
    const { docs } = await payload.find({
      collection: 'chat-documents',
      where: { chatId: { equals: id } },
      sort: '-createdAt',
      depth: 0,
      pagination: false,
    });
    return docs;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by chat id',
    );
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  const payload = await getPayload();
  try {
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
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  const payload = await getPayload();
  try {
    const { docs } = await payload.find({
      collection: 'chat-documents',
      where: {
        documentId: { equals: id },
      },
      sort: '-createdAt',
      limit: 1,
    });
    return docs[0];
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  const payload = await getPayload();
  const transactionId = await payload.db.beginTransaction();
  if (!transactionId) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to begin transaction',
    );
  }
  try {
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

    await payload.db.commitTransaction(transactionId);
  } catch (error) {
    await payload.db.rollbackTransaction(transactionId);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<RequiredDataFromCollectionSlug<'chat-suggestions'>>;
}) {
  const payload = await getPayload();
  const results = [];
  try {
    for (const suggestion of suggestions) {
      const result = await payload.create({
        collection: 'chat-suggestions',
        data: suggestion,
      });
      results.push(result);
    }
    return results;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  const payload = await getPayload();
  try {
    const { docs } = await payload.find({
      collection: 'chat-suggestions',
      where: { 'documentId.documentId': { equals: documentId } },
      sort: '-createdAt',
      depth: 0,
      pagination: false,
    });
    return docs;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  const payload = await getPayload();
  try {
    const message = await payload.findByID({
      collection: 'chat-messages',
      id,
    });
    return message;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  const payload = await getPayload();
  const transactionId = await payload.db.beginTransaction();
  if (!transactionId) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to begin transaction',
    );
  }
  try {
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

    await payload.db.commitTransaction(transactionId);
  } catch (error) {
    await payload.db.rollbackTransaction(transactionId);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
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
  try {
    await payload.update({
      collection: 'chats',
      id: chatId,
      data: { visibility },
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  const payload = await getPayload();
  try {
    const stream = await payload.create({
      collection: 'stream',
      data: { id: streamId, chat: chatId },
    });

    return stream;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  const payload = await getPayload();
  try {
    const { docs: streams } = await payload.find({
      collection: 'stream',
      where: { chat: { equals: chatId } },
      depth: 0,
      pagination: false,
      select: {},
      sort: 'createdAt',
    });

    return streams.map((stream) => stream.id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}
