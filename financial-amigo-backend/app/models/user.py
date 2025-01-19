import uuid

from sqlalchemy import Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    image = Column(String, nullable=True)
    email_verified = Column(Boolean, default=False)
    provider = Column(String, nullable=True)  # "google" or "email"
    google_id = Column(String, unique=True, nullable=True)  # For Google OAuth
    default_currency = Column(String(3), nullable=False, default="CAD")
