import { CollectionConfig } from 'payload';

export const stream: CollectionConfig = {
  slug: 'stream',
  fields: [
    {
      name: 'chat',
      type: 'relationship',
      relationTo: 'chats',
    },
  ],
};
