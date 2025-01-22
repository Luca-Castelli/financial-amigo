from datetime import datetime, timedelta
from functools import wraps
from typing import Callable, Tuple

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

security = HTTPBearer()


def require_auth(func: Callable):
    """Decorator for protected routes that require authentication."""

    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Ensure current_user is in kwargs
        if "current_user" not in kwargs:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Missing current_user dependency",
            )
        return await func(*args, **kwargs)

    return wrapper


def create_access_token(email: str) -> str:
    """Create a short-lived access token."""
    expire = datetime.utcnow() + timedelta(
        minutes=15
    )  # Access token expires in 15 minutes
    to_encode = {"exp": expire, "email": email, "type": "access"}
    return jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_refresh_token(email: str) -> str:
    """Create a long-lived refresh token."""
    expire = datetime.utcnow() + timedelta(days=7)  # Refresh token expires in 7 days
    to_encode = {"exp": expire, "email": email, "type": "refresh"}
    return jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_tokens(email: str) -> Tuple[str, str]:
    """Create both access and refresh tokens."""
    access_token = create_access_token(email)
    refresh_token = create_refresh_token(email)
    return access_token, refresh_token


def verify_token(token: str, token_type: str = "access") -> dict:
    """Verify and decode a token."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

        # Verify token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {token_type} token.",
            )

        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Validate the access token and return the current user."""
    try:
        # Remove 'Bearer ' prefix if present
        token = credentials.credentials.replace("Bearer ", "")

        # Verify the token is an access token
        payload = verify_token(token, "access")

        # Get user from database
        email: str = payload.get("email")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
