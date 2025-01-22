import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class User(Base):
    """
    Model for application users
    """

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)  # Required for Google OAuth
    image = Column(String, nullable=True)  # Profile image URL
    provider = Column(String, nullable=False, default="google")
    google_id = Column(String, unique=True, nullable=False)
    default_currency = Column(String, nullable=False, default="CAD")

    # Relationships
    accounts = relationship("Account", back_populates="user")

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )
