import { Pool } from 'pg';
const globalDatabase = globalThis as unknown as { database?: Pool };
export const database = globalDatabase.database ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
if (process.env.NODE_ENV !== 'production') globalDatabase.database = database;
