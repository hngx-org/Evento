import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pgClient = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // use only for development with self-signed certificates
  },
});
