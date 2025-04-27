import { CollectionConfig } from 'payload';

export const messages: CollectionConfig = {
  slug: 'chat-messages',
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
      name: 'role',
      type: 'select',
      options: ['user', 'assistant', 'data', 'system'],
      required: true,
    },
    {
      name: 'parts',
      type: 'json',
      required: true,
    },
    {
      name: 'attachments',
      type: 'json',
      required: true,
    },
  ],
};
