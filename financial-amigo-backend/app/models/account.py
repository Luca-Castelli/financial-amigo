from enum import Enum as PyEnum
from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class AccountType(str, PyEnum):
    TFSA = "TFSA"
    RRSP = "RRSP"
    FHSA = "FHSA"
    NON_REGISTERED = "NON_REGISTERED"


class Currency(str, PyEnum):
    CAD = "CAD"
    USD = "USD"


class Account(Base):
    """Investment account model (e.g., TD TFSA Account)."""

    __tablename__ = "accounts"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Basic details
    name = Column(String, nullable=False)  # e.g., "TD TFSA Account"
    type = Column(
        Enum(
            AccountType, name="account_type", create_constraint=True, native_enum=True
        ),
        nullable=False,
    )
    currency = Column(
        Enum(Currency, name="currency", create_constraint=True, native_enum=True),
        nullable=False,
        server_default=Currency.CAD.value,
    )
    description = Column(String)

    # Optional details
    broker = Column(String)  # e.g., "TD", "Questrade"
    account_number = Column(String)  # Account identifier at broker

    # Cash tracking
    cash_balance = Column(Float, nullable=False, server_default="0")

    # Relationships
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user = relationship("User", back_populates="accounts")
    transactions = relationship(
        "Transaction", back_populates="account", cascade="all, delete-orphan"
    )

    # Audit fields
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=text("now()"),
    )
