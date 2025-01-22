import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class TransactionType(str, enum.Enum):
    BUY = "BUY"  # Buy securities
    SELL = "SELL"  # Sell securities


class Transaction(Base):
    """
    Model for investment transactions (security trades only)
    """

    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False)
    security_id = Column(
        UUID(as_uuid=True), ForeignKey("securities.id"), nullable=False
    )

    # Transaction details
    type = Column(Enum(TransactionType), nullable=False)
    trade_date = Column(DateTime, nullable=False)  # When the trade was executed
    settlement_date = Column(
        DateTime, nullable=True
    )  # When the trade settles (T+2 typically)
    quantity = Column(Numeric(20, 6), nullable=False)  # Negative for sells
    price_native = Column(
        Numeric(20, 6), nullable=False
    )  # Price per unit in security's currency
    total_native = Column(
        Numeric(20, 6), nullable=False
    )  # Total in security's currency
    total_account = Column(
        Numeric(20, 6), nullable=False
    )  # Total in account's currency
    fees_native = Column(
        Numeric(20, 6), nullable=False, default=0
    )  # Fees in security's currency
    description = Column(String, nullable=True)

    # Exchange rate details
    fx_rate = Column(
        Numeric(20, 6), nullable=True
    )  # Rate between security and account currency

    # Relationships
    account = relationship("Account", back_populates="transactions")
    security = relationship("Security", back_populates="transactions")
    cash_transaction = relationship(
        "CashTransaction", back_populates="related_transaction", uselist=False
    )

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow())
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow(),
        onupdate=datetime.utcnow(),
    )
