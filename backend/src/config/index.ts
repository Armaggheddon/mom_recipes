// Gemini api configuration
export const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME
  ? process.env.GEMINI_MODEL_NAME
  : "gemini-2.5-flash-lite";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Database configuration
export const PG_USER = process.env.PG_USER;
export const PG_HOST = process.env.PG_HOST;
export const PG_PORT = process.env.PG_PORT
  ? parseInt(process.env.PG_PORT, 10)
  : 5432;
export const PG_DATABASE = process.env.PG_DATABASE;
export const PG_PASSWORD = process.env.PG_PASSWORD;

// Minio configuration
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT
  ? process.env.MINIO_ENDPOINT
  : "";
export const MINIO_PORT = process.env.MINIO_PORT
  ? parseInt(process.env.MINIO_PORT, 10)
  : 9000;
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY
  ? process.env.MINIO_ACCESS_KEY
  : "";
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY
  ? process.env.MINIO_SECRET_KEY
  : "";
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";

// Application configuration
export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
