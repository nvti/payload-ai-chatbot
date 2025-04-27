import {
  CollectionConfig,
  TextareaField,
  TextField,
  ValidateOptions,
} from 'payload';

export const knowledgeDocs: CollectionConfig = {
  slug: 'rag-knowledge-docs',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: ['raw', 'webpage', 'document'],
          defaultValue: 'raw',
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (data, siblingData) => {
              return siblingData.type === 'webpage';
            },
          },
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'rag-knowledge-docs-upload' as any,
          admin: {
            condition: (data, siblingData) => {
              return siblingData.type === 'document';
            },
          },
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      validate: (
        value: string | null | undefined,
        options: ValidateOptions<unknown, unknown, TextField, string>,
      ) => {
        const data = options.siblingData as any;
        if (data?.type === 'raw' && !value) {
          return 'This is raw, so it must have a title';
        }
        return true;
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'fulfilled', 'indexed', 'error'],
      defaultValue: 'pending',
      hasMany: false,
    },
    {
      name: 'content',
      type: 'textarea',
      validate: (
        value: string | null | undefined,
        options: ValidateOptions<unknown, unknown, TextareaField, string>,
      ) => {
        const data = options.siblingData as any;
        if (data?.type === 'raw' && !value) {
          return 'This is raw, so it must have a title';
        }
        return true;
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        if (data.type === 'raw' && data.status === 'pending') {
          data.status = 'fulfilled';
        }
      },
    ],
  },
};

export const knowledgeDocsUpload: CollectionConfig = {
  slug: 'rag-knowledge-docs-upload',
  admin: {
    hidden: true,
  },
  upload: true,
  fields: [],
};
