-- Enable the pgvector extension in the 'docrag' database
-- This assumes the database 'docrag' is already created by POSTGRES_DB env var.
CREATE EXTENSION IF NOT EXISTS vector;

-- Optionally, create tables if they don't exist, though Django migrations handle this.
-- This is mostly for demonstration or quick setup without full Django context.
-- Django's `manage.py migrate` is the preferred way to manage schema.
-- So, leaving this minimal.

-- Optional: Create a sample table for testing
-- CREATE TABLE items (
--     id SERIAL PRIMARY KEY,
--     embedding VECTOR(3) -- Example for 3-dimensional vectors
-- );