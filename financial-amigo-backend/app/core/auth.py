import os
from datetime import datetime, timedelta
from typing import Literal, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from google.auth.transport import requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

# Allow HTTP for development
if not settings.USE_HTTPS:
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# OAuth configuration
oauth_flow = Flow.from_client_config(
    client_config={
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
        }
    },
    scopes=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
)
oauth_flow.redirect_uri = settings.GOOGLE_REDIRECT_URI

# JWT configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


def create_token(email: str, token_type: Literal["access", "refresh"]) -> str:
    """Create a JWT token (access or refresh)"""
    if token_type == "access":
        expire_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        secret = settings.JWT_SECRET_KEY
    else:  # refresh
        expire_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        secret = settings.JWT_REFRESH_SECRET_KEY

    expire = datetime.utcnow() + expire_delta
    to_encode = {"sub": email, "exp": expire, "type": token_type}
    return jwt.encode(to_encode, secret, algorithm=settings.JWT_ALGORITHM)


async def verify_token(
    token: str, token_type: Literal["access", "refresh"]
) -> Optional[str]:
    """Verify a JWT token and return the email if valid"""
    if not token:
        return None

    try:
        secret = (
            settings.JWT_SECRET_KEY
            if token_type == "access"
            else settings.JWT_REFRESH_SECRET_KEY
        )
        payload = jwt.decode(token, secret, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload.get("sub")
    except JWTError:
        return None


async def verify_google_token(token: str) -> dict:
    """Verify Google OAuth token and return user info"""
    try:
        return id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=2,  # Allow 2 seconds of clock skew
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Get the current authenticated user"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = await verify_token(token, "access")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Please log in again.",
        )

    return user
