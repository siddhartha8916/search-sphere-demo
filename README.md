# SearchSphere

![SearchSphere Logo](./frontend/public/searchsphere-logo.png)

A hybrid search engine that combines keyword matching with AI-powered semantic search. Search your documents with precision and understanding.

## Quick Start

```bash
# Clone and start with Docker
git clone <repository-url>
cd hybrid-search-demo
docker-compose up -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

## How It Works

### Hybrid Scoring Formula

SearchSphere combines two search approaches:

```python
# Keyword score from PGroonga full-text search
keyword_score = pgroonga_score(tableoid, ctid)

# Semantic similarity from pgvector (cosine distance)
semantic_score = 1 - (embedding <=> query_embedding)

# Combined hybrid score (50/50 split)
hybrid_score = (0.5 × keyword_score) + (0.5 × semantic_score)
```

**Why this works:** Keyword search finds exact matches while semantic search understands meaning, combining both gives better results.

### Embedding Model

**Model Used:** OpenAI's `text-embedding-3-small`

- **Dimensions:** 1536
- **Quality:** High-quality embeddings optimized for search and retrieval tasks
- **Cost-effective:** Smaller and cheaper than text-embedding-3-large while maintaining excellent performance

### Search Technology

**PGroonga** is used for full-text keyword search with better multilingual support than PostgreSQL's built-in FTS.

## Example Queries

Try these to see both keyword and semantic search in action:

### 1. Technical Terms
```
"pgvector HNSW index"
```
Keyword finds exact terms, semantic finds related concepts like "vector similarity search"

### 2. Natural Questions
```
"How do I store vectors for similarity search?"
```
Semantic understanding matches docs about embeddings and vector databases

### 3. Conceptual Search
```
"renewable energy storage methods"
```
Finds exact phrase + semantically related terms like "battery technology" and "power storage"

### 4. Performance Optimization
```
"improve page performance without blocking render"
```
Understands web optimization concepts, finds "async loading" and "critical rendering path"

### 5. Testing Concepts
```
"benefits of unit testing vs test coverage"
```
Understands comparison aspect, finds docs on testing strategies and metrics

## Project Setup

### Tech Stack

**Backend:**
- FastAPI (Python 3.11+)
- PostgreSQL 15+ with pgvector + PGroonga
- SQLAlchemy (async)
- Sentence Transformers

**Frontend:**
- Next.js 14 (TypeScript)
- Tailwind CSS
- React Hooks

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python ./run.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Future Improvements

### If Given More Time

**1. Deploy Local AI Model on GPU**
- Host local embedding model (e.g., all-MiniLM-L6-v2) on dedicated GPU server to eliminate OpenAI API costs and improve speed.

**2. Web Scraping Integration**
- Add URL input to automatically scrape, extract, and index web content with scheduled re-indexing.

**3. Enhanced File Support**
- Add PDF and DOCX parsing for broader document support.

**4. Observability & Monitoring**
- Implement metrics dashboard for query volume, response times, cache hit rates, and index health monitoring.

**5. Caching Layer**
- Add Redis cache for frequent queries and pre-computed embeddings to improve performance.

**6. Search Enhancements**
- Add query autocomplete, spell correction, and related document recommendations.

**7. Advanced ML Features**
- Fine-tune embeddings on domain-specific data and implement learning-to-rank based on user feedback.

**8. Production Readiness**
- Add authentication, rate limiting, horizontal scaling, and database read replicas.

**9. Integration Features**
- Create REST API client SDKs and webhooks for third-party integrations (Slack, Teams, Notion).

**10. Enterprise Features**
- Implement multi-tenancy, role-based access control, audit logging, and data retention policies.

## Project Structure

```
hybrid-search-demo/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── models/   # Database models
│   │   └── schemas/  # Pydantic schemas
│   └── init.sql      # Database setup
├── frontend/         # Next.js application
│   └── src/
│       ├── app/      # App router pages
│       ├── components/ # React components
│       └── hooks/    # Custom hooks
└── docker-compose.yml
```

## API Endpoints

```http
POST   /api/v1/hybrid-search/upload          # Upload document
GET    /api/v1/hybrid-search/search          # Search (modes: keyword/semantic/hybrid)
GET    /api/v1/hybrid-search/attachments     # List documents
DELETE /api/v1/hybrid-search/attachments/:id # Delete document
```

---

**Built with FastAPI, PostgreSQL (pgvector + PGroonga), and Next.js**
