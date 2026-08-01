import { drizzle } from 'drizzle-orm/node-postgres';

const connectionString = process.env.NODE_ENV === 'test'
  ? process.env.DATABASE_URL_TEST
  : process.env.DATABASE_URL;

const db = drizzle({ connection: connectionString });

export { db };