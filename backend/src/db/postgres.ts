// src/db/postgres.ts
// Handles the connection to the PostgreSQL database.
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PG_USER || "admin",
  host: process.env.PG_HOST || "mom_recipes",
  database: process.env.PG_DATABASE || "mom_recipes",
  password: process.env.PG_PASSWORD || "db_password",
  port: Number(process.env.PG_PORT) || 5432,
});

export default pool;