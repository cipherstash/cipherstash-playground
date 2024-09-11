import 'server-only'

import * as schema from './schema';
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const username = process.env.PG_USER || 'postgres';
const password = process.env.PG_PASSWORD || 'password';
const database = process.env.PG_DATABASE || 'postgres';
const host = process.env.PG_HOST || 'localhost';
const port = process.env.PG_PORT || 6432;

const client = new Client({
  connectionString: `postgres://${username}:${password}@${host}:${port}/${database}`,
});

await client.connect()

export const db = drizzle(client, { schema });