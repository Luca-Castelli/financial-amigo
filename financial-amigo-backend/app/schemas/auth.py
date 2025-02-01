from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    """Response model for token endpoints"""

    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Token type (always 'bearer')")


class UserResponse(BaseModel):
    """Response model for user information"""

    id: str = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    name: str = Field(..., description="User's full name")
    image: str | None = Field(None, description="URL to user's profile image")
    default_currency: str = Field(
        ...,
        description="User's default currency",
        pattern="^[A-Z]{3}$",
        examples=["CAD", "USD"],
    )
