import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class CashTransactionType(str, enum.Enum):
    CONTRIBUTION = "CONTRIBUTION"  # External cash deposit into account
    WITHDRAWAL = "WITHDRAWAL"  # External cash withdrawal from account
    TRANSFER_IN = "TRANSFER_IN"  # Internal transfer from another account
    TRANSFER_OUT = "TRANSFER_OUT"  # Internal transfer to another account
    INTEREST = "INTEREST"  # Interest earned on cash balance
    FEE = "FEE"  # Account fees
    DIVIDEND = "DIVIDEND"  # Dividend received from security
    TRADE = "TRADE"  # Result of security trade (buy/sell)


class CashTransaction(Base):
    """
    Model for cash movements in investment accounts (contributions, withdrawals, interest, etc.)
    """

    __tablename__ = "cash_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False)
    symbol = Column(
        String, ForeignKey("securities.symbol"), nullable=True
    )  # For dividends
    related_transaction_id = Column(
        UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True
    )  # For trades
    related_cash_transaction_id = Column(
        UUID(as_uuid=True), ForeignKey("cash_transactions.id"), nullable=True
    )  # For transfers

    # Transaction details
    type = Column(Enum(CashTransactionType), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    amount = Column(
        Numeric(20, 6), nullable=False
    )  # Positive for inflow, negative for outflow
    description = Column(String)

    # FX details for transfers between accounts with different currencies
    source_currency = Column(String(3))  # ISO 4217 currency code
    target_currency = Column(String(3))  # ISO 4217 currency code
    fx_rate = Column(Numeric(20, 6))  # Rate from source to target currency

    # Relationships
    account = relationship("Account", back_populates="cash_transactions")
    security = relationship("Security", back_populates="cash_transactions")
    related_transaction = relationship("Transaction", back_populates="cash_transaction")
    # Self-referential relationship for transfers
    related_cash_transaction = relationship(
        "CashTransaction",
        remote_side=[id],
        backref="paired_cash_transaction",
        uselist=False,
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
