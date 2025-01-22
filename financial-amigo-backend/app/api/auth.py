from app.core.auth import create_access_token, create_tokens, verify_token
from app.core.database import get_db
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class GoogleUser(BaseModel):
    email: str
    name: str
    image: str | None = None
    google_id: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/sync-google-user")
async def sync_google_user(
    google_user: GoogleUser, db: Session = Depends(get_db)
) -> dict:
    """
    Syncs a Google-authenticated user with our database.
    Creates the user if they don't exist, updates their info if they do.
    Returns both access and refresh tokens.
    """
    # Check if user exists
    user = db.query(User).filter(User.email == google_user.email).first()

    if user:
        # Update existing user's info
        user.name = google_user.name
        user.image = google_user.image
        user.google_id = google_user.google_id
    else:
        # Create new user
        user = User(
            email=google_user.email,
            name=google_user.name,
            image=google_user.image,
            google_id=google_user.google_id,
            provider="google",
        )
        db.add(user)

    try:
        db.commit()
        # Generate both tokens
        access_token, refresh_token = create_tokens(user.email)
        return {
            "status": "success",
            "message": "User synced successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "image": user.image,
            },
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh")
async def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)) -> dict:
    """
    Generate a new access token using a valid refresh token.
    """
    try:
        # Verify the refresh token
        payload = verify_token(request.refresh_token, "refresh")
        email = payload.get("email")

        # Verify user still exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        # Generate new access token
        access_token = create_access_token(email)
        return {
            "status": "success",
            "access_token": access_token,
        }

    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
