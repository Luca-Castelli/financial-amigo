import logging

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.auth import (
    create_token,
    get_current_user,
    oauth_flow,
    verify_google_token,
    verify_token,
)
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse, UserResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/google")
async def google_login():
    """Start the Google OAuth flow"""
    try:
        authorization_url, _ = oauth_flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
        return RedirectResponse(authorization_url)
    except Exception as e:
        logger.error(f"Failed to start OAuth flow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate Google login",
        )


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str = Query(...),
    db: Session = Depends(get_db),
):
    """Handle the OAuth callback from Google"""
    try:
        # Get the full URL but replace http with https if needed
        callback_url = str(request.url)
        if settings.USE_HTTPS and callback_url.startswith("http://"):
            callback_url = "https://" + callback_url[7:]

        # Exchange code for tokens
        oauth_flow.fetch_token(authorization_response=callback_url)

        try:
            # Get user info from Google
            user_info = await verify_google_token(oauth_flow.credentials.id_token)
        except HTTPException as e:
            # Redirect with specific error for clock sync issues
            if "Token used too early" in str(e.detail):
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/login?error=clock_sync",
                    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
                )
            raise

        # Get or create user
        user = db.query(User).filter(User.email == user_info["email"]).first()
        if user:
            # Update existing user
            user.name = user_info["name"]
            user.image = user_info.get("picture")
            user.google_id = user_info["sub"]
        else:
            # Create new user
            user = User(
                email=user_info["email"],
                name=user_info["name"],
                image=user_info.get("picture"),
                google_id=user_info["sub"],
                provider="google",
            )
            db.add(user)

        db.commit()

        # Create tokens
        access_token = create_token(user.email, "access")
        refresh_token = create_token(user.email, "refresh")

        # Redirect back to frontend with tokens in URL fragment
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login#access_token={access_token}&refresh_token={refresh_token}&token_type=bearer",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )

    except Exception as e:
        logger.error(f"OAuth callback error: {str(e)}")
        db.rollback()
        # Redirect with error details
        error_message = (
            str(e) if isinstance(e, HTTPException) else "Authentication failed"
        )
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=auth_failed&error_detail={error_message}",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Get a new access token using a refresh token"""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is required",
        )

    email = await verify_token(refresh_token, "refresh")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return TokenResponse(
        access_token=create_token(user.email, "access"),
        refresh_token=refresh_token,  # Reuse the same refresh token
        token_type="bearer",
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Get current authenticated user"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        image=current_user.image,
        default_currency=current_user.default_currency,
    )
