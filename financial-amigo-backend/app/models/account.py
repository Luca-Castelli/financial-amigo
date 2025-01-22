import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class TaxType(str, enum.Enum):
    TFSA = "TFSA"
    RRSP = "RRSP"
    FHSA = "FHSA"
    NON_REGISTERED = "NON_REGISTERED"


class Account(Base):
    """
    Model for investment accounts (e.g., TD TFSA Investment Account)
    """

    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(
        String, nullable=False
    )  # User-defined name (e.g., "TD TFSA Investment Account")
    description = Column(String, nullable=True)

    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(
        UUID(as_uuid=True), ForeignKey("account_categories.id"), nullable=False
    )

    # Account details
    tax_type = Column(Enum(TaxType), nullable=True)  # Null for non-investment accounts
    currency = Column(
        String(3), nullable=False, default="CAD"
    )  # ISO 4217 currency code
    broker = Column(String, nullable=True)  # For investment accounts
    account_number = Column(String, nullable=True)  # Optional account identifier

    # Cash balance
    cash_balance = Column(
        Numeric(20, 6), nullable=False, default=0
    )  # Current cash balance
    cash_interest_ytd = Column(
        Numeric(20, 6), nullable=False, default=0
    )  # YTD interest earned
    cash_last_updated = Column(
        DateTime, nullable=False, default=datetime.now(datetime.UTC)
    )  # Last balance update

    # Relationships
    user = relationship("User", back_populates="accounts")
    category = relationship("AccountCategory", back_populates="accounts")
    holdings = relationship("Holding", back_populates="account")
    transactions = relationship("Transaction", back_populates="account")
    cash_transactions = relationship("CashTransaction", back_populates="account")
    historical_balances = relationship("HistoricalBalance", back_populates="account")
    portfolio_benchmarks = relationship("PortfolioBenchmark", back_populates="account")

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )
