from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.routers import hybrid_search


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for the application"""
    # Startup - database tables should already exist from init scripts
    print("Starting up Hybrid Search Backend API...")
    yield
    # Shutdown
    print("Shutting down Hybrid Search Backend API...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan,
        description="A FastAPI backend for hybrid search functionality - upload documents and perform semantic/keyword search"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers with /api/v1 prefix
    app.include_router(hybrid_search.router, prefix="/api/v1")
    
    @app.get("/")
    async def root():
        return {
            "message": f"Welcome to {settings.app_name}!",
            "version": settings.app_version,
            "docs": "/docs"
        }
    
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy", 
            "database": "postgresql",
            "version": settings.app_version
        }
    
    return app


app = create_app()