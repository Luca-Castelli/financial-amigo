import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class HistoricalPrice(Base):
    """
    Model for tracking historical security prices
    """

    __tablename__ = "historical_prices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    security_id = Column(
        UUID(as_uuid=True), ForeignKey("securities.id"), nullable=False
    )
    date = Column(DateTime, nullable=False)
    open = Column(Numeric(20, 6), nullable=False)
    high = Column(Numeric(20, 6), nullable=False)
    low = Column(Numeric(20, 6), nullable=False)
    close = Column(Numeric(20, 6), nullable=False)
    volume = Column(Numeric(20, 2), nullable=True)
    adjusted_close = Column(Numeric(20, 6), nullable=False)  # For return calculations

    # Relationships
    security = relationship("Security", back_populates="historical_prices")

    # Ensure one price per security per day
    __table_args__ = (
        UniqueConstraint("security_id", "date", name="uix_security_date"),
    )

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )
