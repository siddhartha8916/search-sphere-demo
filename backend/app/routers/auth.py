"""
Authentication router for login/logout
"""
from fastapi import APIRouter, HTTPException, status, Response, Cookie
from typing import Optional
from pydantic import BaseModel
from app.services.auth import AuthService


router = APIRouter(prefix="/auth", tags=["authentication"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    username: str


class VerifyResponse(BaseModel):
    authenticated: bool
    username: Optional[str] = None


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, response: Response):
    """
    Authenticate user and set cookie
    
    Credentials:
    - username: DemoUser
    - password: DemoPass123
    """
    # Authenticate user
    if not AuthService.authenticate_user(login_data.username, login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create auth token (username_password format)
    auth_token = AuthService.create_auth_token(login_data.username, login_data.password)
    
    # Set token in HTTP-only cookie
    response.set_cookie(
        key="auth_token",
        value=auth_token,
        httponly=True,
        max_age=86400,  # 24 hours
        samesite="lax",
        secure=False  # Set to True in production with HTTPS
    )
    
    return LoginResponse(
        success=True,
        message="Login successful",
        username=login_data.username
    )


@router.get("/verify", response_model=VerifyResponse)
async def verify(auth_token: Optional[str] = Cookie(None)):
    """
    Verify the authentication cookie
    Returns authentication status and username if authenticated
    """
    if not auth_token:
        return VerifyResponse(authenticated=False)
    
    # Verify token
    if not AuthService.verify_token(auth_token):
        return VerifyResponse(authenticated=False)
    
    # Extract username from token
    try:
        username = auth_token.split("_", 1)[0]
        return VerifyResponse(authenticated=True, username=username)
    except:
        return VerifyResponse(authenticated=False)


@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing the auth cookie"""
    response.delete_cookie(key="auth_token")
    return {"success": True, "message": "Logged out successfully"}
