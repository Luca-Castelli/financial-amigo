from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class Currency(str, Enum):
    CAD = "CAD"
    USD = "USD"

    def __str__(self) -> str:
        return self.value


class UserBase(BaseModel):
    """Base user fields"""

    email: str
    name: str
    image: str | None = None
    default_currency: Currency = Currency.CAD


class UserResponse(UserBase):
    """Response model for user information"""

    id: UUID

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    """Model for updating user settings"""

    default_currency: Currency = Field(..., description="User's default currency")
