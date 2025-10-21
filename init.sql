-- Hybrid Search Demo Database Initialization Script
-- This script sets up the database schema for hybrid search functionality

-- Create the database
CREATE DATABASE hybrid_search_db;

-- Connect to the Database
\c hybrid_search_db;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgroonga;

-- Create schema
CREATE SCHEMA IF NOT EXISTS hybrid_search;

-- Drop tables if they exist (for development/reset purposes)
DROP TABLE IF EXISTS hybrid_search.attachments CASCADE;

-- Attachments table for uploaded documents with hybrid search support
CREATE TABLE hybrid_search.attachments (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),  -- OpenAI text-embedding-3-small or sentence-transformers dimension
    content_length INTEGER GENERATED ALWAYS AS (length(content)) STORED,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient search
-- PGroonga index for full-text search
CREATE INDEX idx_attachments_content_pgroonga 
    ON hybrid_search.attachments 
    USING pgroonga (content);

-- Vector index for semantic search (HNSW for faster approximate nearest neighbor search)
CREATE INDEX idx_attachments_embedding_hnsw 
    ON hybrid_search.attachments 
    USING hnsw (embedding vector_cosine_ops);

-- Standard B-tree index on file_name for filtering
CREATE INDEX idx_attachments_file_name 
    ON hybrid_search.attachments (file_name);

-- Index on uploaded_at for time-based queries
CREATE INDEX idx_attachments_uploaded_at 
    ON hybrid_search.attachments (uploaded_at DESC);

-- Create the database user
CREATE USER hybrid_search_user WITH PASSWORD 'hybrid_search_pwd';

-- Grant connection to the database
GRANT CONNECT ON DATABASE hybrid_search_db TO hybrid_search_user;

-- Grant usage on the schema
GRANT USAGE ON SCHEMA hybrid_search TO hybrid_search_user;

-- Grant all privileges on tables in the schema
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA hybrid_search TO hybrid_search_user;

-- Grant usage on sequences (for SERIAL primary keys)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA hybrid_search TO hybrid_search_user;

-- Alter default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA hybrid_search 
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO hybrid_search_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA hybrid_search 
    GRANT USAGE, SELECT ON SEQUENCES TO hybrid_search_user;