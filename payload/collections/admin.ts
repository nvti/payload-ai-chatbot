import type { CollectionConfig } from "payload";

export const admin: CollectionConfig = {
  slug: "admin",
  auth: true,
  admin: {
    defaultColumns: ["name", "email"],
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
