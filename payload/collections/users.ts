import type { CollectionConfig } from "payload";

export const users: CollectionConfig = {
  slug: "users",
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
    },
    {
      name: "password",
      type: "text",
    },
  ],
};
