from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.config import settings
from app.routers import hybrid_search, auth
from app.services.auth import AuthService


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
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Authentication middleware
    @app.middleware("http")
    async def auth_middleware(request: Request, call_next):
        # Public endpoints that don't require authentication
        public_paths = ["/", "/health", "/docs", "/openapi.json", "/api/v1/auth/login", "/api/v1/auth/logout"]
        
        if request.url.path in public_paths or request.url.path.startswith("/docs"):
            return await call_next(request)
        
        # Check for auth token in cookies
        auth_token = request.cookies.get("auth_token")
        if not auth_token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"}
            )
        
        # Verify token
        if not AuthService.verify_token(auth_token):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid or expired token"}
            )
        
        return await call_next(request)
    
    # Include routers with /api/v1 prefix
    app.include_router(auth.router, prefix="/api/v1")
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