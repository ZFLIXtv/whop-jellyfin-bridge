import { Pool } from "pg";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export const db =
  global.__pgPool ||
  new Pool({
    connectionString: env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = db;
}