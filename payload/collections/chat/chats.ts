import { CollectionConfig } from 'payload';

export const chats: CollectionConfig = {
  slug: 'chats',
  admin: {
    group: 'Chats',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'visibility',
      type: 'select',
      options: ['public', 'private'],
      defaultValue: 'private',
    },
  ],
};
