import { CollectionConfig } from 'payload';

export const votes: CollectionConfig = {
  slug: 'chat-votes',
  admin: {
    group: 'Chats',
  },
  fields: [
    {
      name: 'chatId',
      type: 'relationship',
      relationTo: 'chats',
      required: true,
    },
    {
      name: 'messageId',
      type: 'relationship',
      relationTo: 'chat-messages',
      required: true,
    },
    {
      name: 'isUpvoted',
      type: 'checkbox',
      required: true,
    },
  ],
};
