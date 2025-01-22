import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class HistoricalBalance(Base):
    """
    Model for tracking historical account balances (end of day)
    """

    __tablename__ = "historical_balances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False)
    date = Column(DateTime, nullable=False)

    # Value details
    cash_balance = Column(Numeric(20, 6), nullable=False)
    market_value = Column(Numeric(20, 6), nullable=False)  # Sum of all holdings
    total_value = Column(Numeric(20, 6), nullable=False)  # cash + market_value

    # Cash flow tracking
    deposits = Column(Numeric(20, 6), nullable=False, default=0)  # Inflows for the day
    withdrawals = Column(
        Numeric(20, 6), nullable=False, default=0
    )  # Outflows for the day

    # Return components
    dividends = Column(Numeric(20, 6), nullable=False, default=0)  # Dividends received
    interest = Column(Numeric(20, 6), nullable=False, default=0)  # Interest earned
    fees = Column(Numeric(20, 6), nullable=False, default=0)  # Fees paid

    # Relationships
    account = relationship("Account", back_populates="historical_balances")

    # Ensure one balance per account per day
    __table_args__ = (UniqueConstraint("account_id", "date", name="uix_account_date"),)

    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.now(datetime.UTC))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now(datetime.UTC),
        onupdate=datetime.now(datetime.UTC),
    )
