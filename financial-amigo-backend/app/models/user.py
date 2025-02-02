from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.account import Currency


class User(Base):
    """
    Model for application users
    """

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    image = Column(String, nullable=True)
    provider = Column(String, nullable=False, server_default="google")
    google_id = Column(String, unique=True, nullable=False)
    default_currency = Column(
        Enum(Currency, name="currency", create_constraint=True, native_enum=True),
        nullable=False,
        server_default=Currency.CAD.value,
    )

    accounts = relationship(
        "Account", back_populates="user", cascade="all, delete-orphan"
    )

    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=text("now()"),
    )
