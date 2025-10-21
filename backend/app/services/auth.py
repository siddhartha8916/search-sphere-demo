"""
Simple authentication service using cookie-based auth
"""
from typing import Optional
from fastapi import HTTPException, status, Cookie
from app.config import settings


class AuthService:
    """Simple authentication service with hardcoded credentials"""
    
    @classmethod
    def authenticate_user(cls, username: str, password: str) -> bool:
        """Authenticate a user with username and password"""
        return username == settings.auth_username and password == settings.auth_password
    
    @classmethod
    def create_auth_token(cls, username: str, password: str) -> str:
        """Create a simple auth token in format username_password"""
        return f"{username}_{password}"
    
    @classmethod
    def verify_token(cls, token: str) -> bool:
        """Verify auth token by splitting and checking credentials"""
        try:
            parts = token.split("_", 1)  # Split on first underscore only
            if len(parts) != 2:
                return False
            username, password = parts
            return cls.authenticate_user(username, password)
        except Exception:
            return False


# Standalone function for FastAPI dependency
async def get_current_user(auth_token: Optional[str] = Cookie(None)) -> dict:
    """Get current user from auth token cookie"""
    if not auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    if not AuthService.verify_token(auth_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Extract username from token
    username = auth_token.split("_", 1)[0]
    return {
        "username": username,
        "full_name": "Demo User"
    }
