import 'server-only'

import * as schema from './schema';
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const client = new Client({
  connectionString: "postgres://postgres:password@cipherstash-proxy:6432/postgres",
});

await client.connect()

export const db = drizzle(client, { schema });