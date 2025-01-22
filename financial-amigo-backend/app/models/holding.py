import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Holding(Base):
    """
    Model for current holdings/positions in securities
    """

    __tablename__ = "holdings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False)
    security_id = Column(
        UUID(as_uuid=True), ForeignKey("securities.id"), nullable=False
    )

    # Position details
    quantity = Column(Numeric(20, 6), nullable=False)
    avg_cost_native = Column(Numeric(20, 6), nullable=False)  # In security's currency
    book_value = Column(
        Numeric(20, 6), nullable=False
    )  # Total cost in account currency
    market_value = Column(
        Numeric(20, 6), nullable=True
    )  # Current value in account currency

    # Relationships
    account = relationship("Account", back_populates="holdings")
    security = relationship("Security", back_populates="holdings")

    # Ensure unique security per account
    __table_args__ = (
        UniqueConstraint("account_id", "security_id", name="uix_account_security"),
    )

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )
