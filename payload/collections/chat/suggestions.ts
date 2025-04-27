import { CollectionConfig } from 'payload';

export const suggestions: CollectionConfig = {
  slug: 'chat-suggestions',
  admin: {
    group: 'Chats',
  },
  fields: [
    {
      name: 'documentId',
      type: 'relationship',
      relationTo: 'chat-documents',
      required: true,
    },
    {
      name: 'originalText',
      type: 'text',
      required: true,
    },
    {
      name: 'suggestedText',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'isResolved',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
  ],
};
