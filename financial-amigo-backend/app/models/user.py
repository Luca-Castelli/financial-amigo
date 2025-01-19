import uuid

from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)  # Required for Google OAuth
    image = Column(String, nullable=True)  # Optional profile image
    provider = Column(
        String, nullable=False, default="google"
    )  # For future auth methods
    google_id = Column(String, unique=True, nullable=False)  # Required for Google OAuth
    default_currency = Column(String(3), nullable=False, default="CAD")
