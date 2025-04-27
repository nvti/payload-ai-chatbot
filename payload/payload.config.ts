import sharp from 'sharp';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
// import { postgresAdapter } from '@payloadcms/db-postgres';
import { buildConfig } from 'payload';
import { users } from './collections/users';
import { documents } from './collections/chat/documents';
import { chats } from './collections/chat/chats';
import { messages } from './collections/chat/messages';
import { suggestions } from './collections/chat/suggestions';
import { media as chatMedia } from './collections/chat/media';
import { votes } from './collections/chat/votes';
import path from 'path';
import { fileURLToPath } from 'url';
import { admin } from './collections/admin';
import { ragPlugin } from './plugins/rag';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Define and configure your collections in this array
  collections: [
    admin,
    users,
    chats,
    messages,
    votes,
    documents,
    suggestions,
    chatMedia,
  ],

  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || '',
  // Whichever Database Adapter you're using should go here
  // Mongoose is shown as an example, but you can also use Postgres
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
    allowIDOnCreate: true, // Allow ID to be set on create
  }),
  // db: postgresAdapter({
  //   pool: {
  //     connectionString: process.env.DATABASE_URL || '',
  //   },
  //   idType: 'uuid',
  //   allowIDOnCreate: true, // Allow ID to be set on create
  // }),
  // If you'd like to use Rich Text, pass your editor here
  editor: lexicalEditor(),
  plugins: [ragPlugin()],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // If you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // This is optional - if you don't need to do these things,
  // you don't need it!
  sharp,
});
