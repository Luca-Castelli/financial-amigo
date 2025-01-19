from app.core.auth import get_current_user, require_auth
from app.core.database import get_db
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class UserSettingsUpdate(BaseModel):
    default_currency: str


@router.get("/me")
@require_auth
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get the current user's information."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "image": current_user.image,
        "default_currency": current_user.default_currency,
    }


@router.patch("/settings")
@require_auth
async def update_user_settings(
    settings: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's settings."""
    # Validate currency
    if settings.default_currency not in ["CAD", "USD"]:
        raise HTTPException(400, "Invalid currency. Must be CAD or USD.")

    # Update user settings
    current_user.default_currency = settings.default_currency
    db.commit()
    db.refresh(current_user)

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "image": current_user.image,
        "default_currency": current_user.default_currency,
    }
