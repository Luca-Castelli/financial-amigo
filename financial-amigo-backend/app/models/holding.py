import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    text,
)
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
    symbol = Column(String, ForeignKey("securities.symbol"), nullable=False)

    # Position details
    quantity = Column(Numeric(20, 6), nullable=False)
    avg_cost_native = Column(Numeric(20, 6), nullable=False)  # In security's currency
    market_value_native = Column(Numeric(20, 6))  # Current value in security's currency
    unrealized_pl_native = Column(
        Numeric(20, 6)
    )  # Unrealized P/L in security's currency

    # Relationships
    account = relationship("Account", back_populates="holdings")
    security = relationship("Security", back_populates="holdings")

    # Ensure unique security per account
    __table_args__ = (
        UniqueConstraint("account_id", "symbol", name="uix_account_security"),
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
