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


@router.post("/sync-google-user")
async def sync_google_user(
    google_user: GoogleUser, db: Session = Depends(get_db)
) -> dict:
    """
    Syncs a Google-authenticated user with our database.
    Creates the user if they don't exist, updates their info if they do.
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
        return {"status": "success", "message": "User synced successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
