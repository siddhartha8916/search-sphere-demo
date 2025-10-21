# Hybrid Search Backend API

This is a FastAPI backend with PostgreSQL database support, designed for hybrid search functionality using PGroonga and pgvector for semantic and keyword search capabilities.

## Features

- **FastAPI** with async/await support
- **PostgreSQL** database with pgvector and PGroonga extensions
- **Hybrid Search** combining keyword and semantic search
- **OpenAI Embeddings** using text-embedding-3-small model
- **SQLAlchemy ORM** with async support
- **Database initialization** via SQL scripts (no migrations needed)
- **File upload and processing** with automatic embedding generation
- **Schema-based database organization**
- **Docker support** for containerization

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Configuration settings
│   ├── database/
│   │   ├── __init__.py
│   │   └── connection.py    # Database connection and session
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py        # SQLAlchemy models (Attachment)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic schemas for validation
│   ├── services/
│   │   ├── __init__.py
│   │   ├── embeddings.py    # OpenAI embeddings service
│   │   └── db_utils.py      # Direct database utilities
│   ├── crud/
│   │   ├── __init__.py
│   │   └── crud.py          # CRUD operations for attachments
│   └── routers/
│       ├── __init__.py
│       └── hybrid_search.py # Hybrid search endpoints
├── requirements.txt
├── Dockerfile               # Container configuration
├── run.py                   # Development server
├── .env                     # Environment variables
└── README.md
```

## Database Schema

The database is focused on document storage and hybrid search:

### Hybrid Search Tables
- **attachments**: Uploaded files with content and vector embeddings
  - `id`: Serial primary key
  - `file_name`: Original filename
  - `content`: Full text content
  - `embedding`: 384-dimension vector for semantic search
  - `content_length`: Computed column for file size
  - `uploaded_at`, `updated_at`: Timestamps

### Extensions
- **pgvector**: Vector similarity search with cosine distance
- **PGroonga**: Full-text search with advanced text processing

### Indexes
- **HNSW index** on embeddings for fast semantic search
- **PGroonga index** on content for full-text keyword search
- **B-tree indexes** on file_name and uploaded_at for filtering

## API Endpoints

### Hybrid Search
- `POST /hybrid-search/upload` - Upload and process files
- `GET /hybrid-search/search?q={query}&mode={mode}` - Search files (keyword/semantic/hybrid)
- `GET /hybrid-search/attachments` - List uploaded files
- `DELETE /hybrid-search/attachments/{id}` - Delete uploaded file

### Health & Info
- `GET /` - API welcome and version information
- `GET /health` - Health check endpoint

## Setup

### Prerequisites

1. **OpenAI API Key**: Get from https://platform.openai.com/api-keys
2. **PostgreSQL**: With pgvector and PGroonga extensions

### Local Development

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On Linux/Mac
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL with Extensions:**
   ```bash
   # Install PostgreSQL with pgvector
   # For Docker: use ankane/pgvector image
   # For local: install pgvector extension
   
   # Install PGroonga (for Ubuntu/Debian)
   wget -O - https://packages.groonga.org/debian/groonga-archive-keyring.gpg | sudo apt-key add -
   echo "deb https://packages.groonga.org/debian/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/groonga.list
   sudo apt-get update
   sudo apt-get install postgresql-16-pgroonga
   ```

4. **Initialize Database:**
   ```bash
   psql -U postgres -f ../init-db.sql
   ```

5. **Configure environment:**
   ```bash
   copy .env.example .env
   ```
   Update the `.env` file with your OpenAI API key and database configuration:
   ```env
   OPENAI_API_KEY=your-actual-openai-api-key-here
   DATABASE_URL=postgresql+asyncpg://hybrid_search_user:hybrid_search_pwd@localhost:5432/hybrid_search_db
   DB_SCHEMA=hybrid_search
   ```

6. **Run the application:**
   ```bash
   python run.py
   ```

### Docker Development

1. **Set environment variables:**
   ```bash
   # Create or update .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your-actual-openai-api-key-here" > .env
   ```

2. **Using Docker Compose:**
   ```bash
   docker-compose up --build
   ```

This will start:
- PostgreSQL database with pgvector and PGroonga extensions on port 5432
- FastAPI backend on port 8000
- Frontend (if configured) on port 3000

## Testing the Hybrid Search

1. **Upload a file:**
   ```bash
   curl -X POST "http://localhost:8000/hybrid-search/upload" \
        -H "Content-Type: multipart/form-data" \
        -F "file=@your-document.txt"
   ```

2. **Search (hybrid mode):**
   ```bash
   curl "http://localhost:8000/hybrid-search/search?q=your+query&mode=hybrid"
   ```

3. **Search modes:**
   - `keyword`: Full-text search using PGroonga
   - `semantic`: Vector similarity using pgvector
   - `hybrid`: Combined keyword + semantic (default)

## Interactive API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://hybrid_search_user:hybrid_search_pwd@localhost:5432/hybrid_search_db

# Application Configuration
APP_NAME=Hybrid Search Backend API
APP_VERSION=1.0.0
DEBUG=true

# Database Schema
DB_SCHEMA=hybrid_search

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
```

## Database Management

### Schema Initialization
The database schema is completely managed through SQL init scripts:
- **`init-db.sql`**: Creates database, user, schema, attachments table, indexes, and triggers
- No migrations needed - schema changes are made directly in init scripts
- Optimized indexes for hybrid search (PGroonga + pgvector)

### Database Features
- Automatic `updated_at` timestamp trigger
- HNSW index for fast vector similarity search
- PGroonga index for full-text keyword search
- Proper indexes for performance optimization
- Computed `content_length` column

## Security Features

- Input validation with Pydantic schemas
- SQL injection prevention with SQLAlchemy ORM
- Proper database user permissions (read/write on hybrid_search schema only)
- File type validation for uploads
- File size limits (10MB max)

## Development Notes

- Database tables are created by init scripts, not the application
- All database operations are asynchronous
- Proper error handling and HTTP status codes
- Comprehensive data validation with Pydantic
- Vector embeddings generated using OpenAI text-embedding-3-small (384 dimensions)
- Hybrid search combines keyword (PGroonga) and semantic (pgvector) results
- No database migrations - schema changes via init scripts

## Embedding Model

The API uses **OpenAI text-embedding-3-small** model:
- **Dimensions**: 384 (optimized for speed and storage)
- **Context Length**: 8,191 tokens
- **Cost**: $0.020 per 1M tokens
- **Performance**: Fast embedding generation with good quality

## Future Extensions

This backend can be extended with:
- Authentication and authorization (JWT)
- Rate limiting for API endpoints
- Background tasks with Celery for batch processing
- Caching with Redis for frequently accessed embeddings
- Support for multiple embedding models
- Document chunking for large files
- Metadata extraction from documents
- Advanced filtering and faceting
- Logging and monitoring
- API versioning