from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.transaction import TransactionType


class TransactionBase(BaseModel):
    """Base schema for transaction data."""

    date: date
    symbol: str
    quantity: float = Field(0, ge=0)
    price_native: float = Field(..., gt=0)
    commission_native: float = Field(0, ge=0)
    currency: str
    type: TransactionType
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a new transaction."""

    account_id: UUID


class TransactionUpdate(BaseModel):
    """Schema for updating an existing transaction."""

    date: Optional[date] = None
    symbol: Optional[str] = None
    quantity: Optional[float] = Field(None, ge=0)
    price_native: Optional[float] = Field(None, gt=0)
    commission_native: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = None
    type: Optional[TransactionType] = None
    description: Optional[str] = None


class Transaction(TransactionBase):
    """Schema for a transaction."""

    id: UUID
    account_id: UUID
    total_native: float

    class Config:
        """Pydantic config."""

        from_attributes = True
