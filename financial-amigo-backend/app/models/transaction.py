from enum import Enum as PyEnum
from uuid import uuid4

from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.account import Currency


class TransactionType(str, PyEnum):
    BUY = "BUY"
    SELL = "SELL"
    DIVIDEND = "DIVIDEND"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    date = Column(Date, nullable=False)
    symbol = Column(String, nullable=False)
    quantity = Column(Float, nullable=False, default=0)
    price_native = Column(Float, nullable=False)  # Price in security's currency
    commission_native = Column(
        Float, nullable=False, server_default="0"
    )  # Commission in security's currency
    currency = Column(
        Enum(Currency, name="currency", create_constraint=True, native_enum=True),
        nullable=False,
        server_default=Currency.CAD.value,
    )
    type = Column(
        Enum(
            TransactionType,
            name="transaction_type",
            create_constraint=True,
            native_enum=True,
        ),
        nullable=False,
    )
    description = Column(String)
    total_native = Column(Float, nullable=False)  # Total in security's currency

    # Relationships
    account_id = Column(
        UUID(as_uuid=True),
        ForeignKey("accounts.id", ondelete="CASCADE"),
        nullable=False,
    )
    account = relationship("Account", back_populates="transactions")

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

    @hybrid_property
    def calculated_total_native(self) -> float:
        """Calculate total in security's currency including commission."""
        base_amount = (
            self.price_native
            if self.type == TransactionType.DIVIDEND
            else self.quantity * self.price_native
        )
        return base_amount - self.commission_native

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Always set the total based on the calculation
        self.total_native = self.calculated_total_native
