import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class CategoryType(str, enum.Enum):
    INVESTMENT = "INVESTMENT"  # Only investment accounts for MVP


class AccountCategory(Base):
    """
    Model for account categories (MVP: Investment accounts only)
    """

    __tablename__ = "account_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)  # e.g., "Investment Accounts"
    type = Column(Enum(CategoryType), nullable=False)
    description = Column(String, nullable=True)

    # Relationships
    accounts = relationship("Account", back_populates="category")

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )
