import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Security(Base):
    """
    Model for investment securities.
    """

    __tablename__ = "securities"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Business key
    symbol = Column(
        String, unique=True, index=True, nullable=False
    )  # e.g., AAPL, VGRO.TO
    name = Column(String, nullable=False)

    # Asset classification (from data provider, e.g. Yahoo Finance)
    asset_type = Column(String, nullable=False)  # EQUITY, FIXED_INCOME, etc.
    sector = Column(String, index=True, nullable=True)  # Technology, Healthcare, etc.
    industry = Column(
        String, index=True, nullable=True
    )  # Software - Infrastructure, etc.
    market_cap = Column(Numeric(20, 2), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    # Trading details
    exchange = Column(String, nullable=False)
    currency = Column(String(3), nullable=False)  # ISO 4217 currency code

    # Latest price data
    last_price = Column(Numeric(20, 6), nullable=True)
    last_price_updated = Column(DateTime, nullable=True)

    # Relationships
    holdings = relationship("Holding", back_populates="security")
    transactions = relationship("Transaction", back_populates="security")
    cash_transactions = relationship("CashTransaction", back_populates="security")
    historical_prices = relationship("HistoricalPrice", back_populates="security")

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )
