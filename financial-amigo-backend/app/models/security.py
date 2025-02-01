from sqlalchemy import Boolean, Column, DateTime, Numeric, String, text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Security(Base):
    """
    Model for securities (stocks, ETFs, etc.)
    """

    __tablename__ = "securities"

    # Primary key is the symbol
    symbol = Column(String, primary_key=True)
    name = Column(String, nullable=False)

    # Asset classification (from data provider, e.g. Yahoo Finance)
    type = Column(String, nullable=False)  # STOCK, ETF, etc.
    sector = Column(String, index=True)  # Technology, Healthcare, etc.
    industry = Column(String, index=True)  # Software - Infrastructure, etc.
    market_cap = Column(Numeric(20, 2))
    is_active = Column(Boolean, nullable=False, server_default="true")

    # Trading details
    exchange = Column(String, nullable=False)
    currency = Column(String(3), nullable=False)  # ISO 4217 currency code

    # Latest price data
    last_price = Column(Numeric(20, 6))
    last_price_updated = Column(DateTime(timezone=True))

    # Relationships
    holdings = relationship(
        "Holding", back_populates="security", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", back_populates="security", cascade="all, delete-orphan"
    )
    cash_transactions = relationship("CashTransaction", back_populates="security")
    historical_prices = relationship(
        "HistoricalPrice", back_populates="security", cascade="all, delete-orphan"
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
