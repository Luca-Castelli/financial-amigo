from functools import wraps
from typing import Callable

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


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Validate the NextAuth.js JWT token and return the current user.
    This is used as a FastAPI dependency to protect routes.
    """
    try:
        # Remove 'Bearer ' prefix if present
        token = credentials.credentials.replace("Bearer ", "")

        # Decode and validate the token
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

        # NextAuth.js includes user email in the token
        email: str = payload.get("email")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        # Get user from database
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
            detail="Invalid authentication token",
        )
