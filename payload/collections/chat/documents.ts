import { CollectionConfig } from 'payload';

export const documents: CollectionConfig = {
  slug: 'chat-documents',
  admin: {
    group: 'Chats',
  },
  fields: [
    {
      name: 'documentId',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'kind',
      type: 'select',
      options: ['text', 'code', 'image', 'sheet'],
      required: true,
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
  ],
};
