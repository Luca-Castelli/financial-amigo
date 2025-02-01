import uuid

from sqlalchemy import (
    Column,
    Date,
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


class HistoricalPrice(Base):
    """
    Model for tracking historical security prices
    """

    __tablename__ = "historical_prices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String, ForeignKey("securities.symbol"), nullable=False)
    date = Column(Date, nullable=False)
    open = Column(Numeric(20, 6), nullable=False)
    high = Column(Numeric(20, 6), nullable=False)
    low = Column(Numeric(20, 6), nullable=False)
    close = Column(Numeric(20, 6), nullable=False)
    volume = Column(Numeric(20, 0), nullable=False)  # Changed to integer-like numeric
    adjusted_close = Column(Numeric(20, 6), nullable=False)  # For return calculations

    # Relationships
    security = relationship("Security", back_populates="historical_prices")

    # Ensure one price per security per day
    __table_args__ = (UniqueConstraint("symbol", "date", name="uix_security_date"),)

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
