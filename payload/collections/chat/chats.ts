import type { CollectionConfig } from "payload";

export const chats: CollectionConfig = {
  slug: "chats",
  admin: {
    group: "Chats",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "userId",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "visibility",
      type: "select",
      options: ["public", "private"],
      required: true,
      defaultValue: "private",
    },
    {
      name: "lastContext",
      type: "json",
      typescriptSchema: [
        () => ({
          type: "object",
          properties: {
            modelId: {
              type: "string",
            },
            context: {
              type: "object",
              properties: {
                inputMax: {
                  type: "number",
                },
                outputMax: {
                  type: "number",
                },
                combinedMax: {
                  type: "number",
                },
                totalMax: {
                  type: "number",
                },
              },
            },
            costUSD: {
              type: "object",
              properties: {
                inputUSD: {
                  type: "number",
                },
                outputUSD: {
                  type: "number",
                },
                totalUSD: {
                  type: "number",
                },
                reasoningUSD: {
                  type: "number",
                },
                cacheReadUSD: {
                  type: "number",
                },
                cacheWriteUSD: {
                  type: "number",
                },
              },
            },
            inputTokens: {
              type: "number",
            },
            outputTokens: {
              type: "number",
            },
            totalTokens: {
              type: "number",
            },
            reasoningTokens: {
              type: "number",
            },
            cachedInputTokens: {
              type: "number",
            },
          },
        }),
      ],
    },
  ],
};
