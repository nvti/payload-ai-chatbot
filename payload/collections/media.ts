import type { CollectionConfig } from "payload";

export const media: CollectionConfig = {
  slug: "media",
  fields: [
    {
      name: "alt",
      type: "text",
    },
    {
      name: "caption",
      type: "text",
    },
  ],
  upload: true,
};
