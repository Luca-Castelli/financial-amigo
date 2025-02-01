import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, String, text
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
    symbol = Column(String, ForeignKey("securities.symbol"), nullable=False)

    # Transaction details
    type = Column(Enum(TransactionType), nullable=False)
    trade_date = Column(
        DateTime(timezone=True), nullable=False
    )  # When the trade was executed
    quantity = Column(Numeric(20, 6), nullable=False)  # Negative for sells
    price_native = Column(
        Numeric(20, 6), nullable=False
    )  # Price per unit in security's currency
    commission_native = Column(
        Numeric(20, 6), nullable=False, server_default="0"
    )  # Commission in security's currency
    description = Column(String)

    # Exchange rate details
    fx_rate = Column(
        Numeric(20, 6), nullable=False
    )  # Rate between security and account currency

    # Relationships
    account = relationship("Account", back_populates="transactions")
    security = relationship("Security", back_populates="transactions")
    cash_transaction = relationship(
        "CashTransaction", back_populates="related_transaction", uselist=False
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
