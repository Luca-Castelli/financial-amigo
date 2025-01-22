import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class HistoricalFXRate(Base):
    """
    Model for tracking historical foreign exchange rates
    """

    __tablename__ = "historical_fx_rates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_currency = Column(String(3), nullable=False)  # ISO 4217 currency code
    to_currency = Column(String(3), nullable=False)  # ISO 4217 currency code
    date = Column(DateTime, nullable=False)
    rate = Column(Numeric(20, 6), nullable=False)  # 1 from_currency = X to_currency

    # Ensure one rate per currency pair per day
    __table_args__ = (
        UniqueConstraint(
            "from_currency", "to_currency", "date", name="uix_currency_pair_date"
        ),
    )

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow())
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow(),
        onupdate=datetime.utcnow(),
    )
