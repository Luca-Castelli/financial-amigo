"""create initial tables

Revision ID: dbe4680883eb
Revises: None
Create Date: 2024-01-22 01:28:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = "dbe4680883eb"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable uuid-ossp extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Create users table
    op.create_table(
        "users",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("image", sa.String()),
        sa.Column("provider", sa.String(), nullable=False, server_default="google"),
        sa.Column("google_id", sa.String(), nullable=False),
        sa.Column(
            "default_currency", sa.String(3), nullable=False, server_default="CAD"
        ),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("google_id"),
    )

    # Create accounts table
    op.create_table(
        "accounts",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String()),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="CAD"),
        sa.Column("broker", sa.String()),
        sa.Column("account_number", sa.String()),
        sa.Column(
            "cash_balance", sa.Numeric(20, 6), nullable=False, server_default="0"
        ),
        sa.Column(
            "cash_interest_ytd", sa.Numeric(20, 6), nullable=False, server_default="0"
        ),
        sa.Column(
            "cash_last_updated",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.CheckConstraint(
            "type IN ('TFSA', 'RRSP', 'FHSA', 'NON_REGISTERED')",
            name="valid_account_type",
        ),
    )

    # Create securities table
    op.create_table(
        "securities",
        sa.Column("symbol", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("asset_type", sa.String(), nullable=False),
        sa.Column("asset_subtype", sa.String()),
        sa.Column("sector", sa.String()),
        sa.Column("industry", sa.String()),
        sa.Column("exchange", sa.String(), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("last_price", sa.Numeric(20, 6)),
        sa.Column("last_price_updated", sa.TIMESTAMP(timezone=True)),
        sa.Column("market_cap", sa.Numeric(20, 2)),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
    )

    # Create holdings table
    op.create_table(
        "holdings",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column("account_id", UUID, sa.ForeignKey("accounts.id"), nullable=False),
        sa.Column(
            "symbol", sa.String(), sa.ForeignKey("securities.symbol"), nullable=False
        ),
        sa.Column("quantity", sa.Numeric(20, 6), nullable=False),
        sa.Column("avg_cost_native", sa.Numeric(20, 6), nullable=False),
        sa.Column("market_value_native", sa.Numeric(20, 6)),
        sa.Column("unrealized_pl_native", sa.Numeric(20, 6)),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.UniqueConstraint("account_id", "symbol"),
    )

    # Create transactions table
    op.create_table(
        "transactions",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column("account_id", UUID, sa.ForeignKey("accounts.id"), nullable=False),
        sa.Column("symbol", sa.String(), sa.ForeignKey("securities.symbol")),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("trade_date", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("settlement_date", sa.TIMESTAMP(timezone=True)),
        sa.Column("quantity", sa.Numeric(20, 6)),
        sa.Column("price_native", sa.Numeric(20, 6)),
        sa.Column("total_native", sa.Numeric(20, 6)),
        sa.Column("total_account", sa.Numeric(20, 6)),
        sa.Column("fx_rate", sa.Numeric(20, 6), nullable=False),
        sa.Column("fees_native", sa.Numeric(20, 6), server_default="0"),
        sa.Column("status", sa.String(), nullable=False, server_default="PENDING"),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
    )

    # Create cash_transactions table
    op.create_table(
        "cash_transactions",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column("account_id", UUID, sa.ForeignKey("accounts.id"), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("date", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("amount", sa.Numeric(20, 6), nullable=False),
        sa.Column("description", sa.String()),
        sa.Column("security_id", sa.String(), sa.ForeignKey("securities.symbol")),
        sa.Column("related_transaction_id", UUID, sa.ForeignKey("transactions.id")),
        sa.Column(
            "related_cash_transaction_id", UUID, sa.ForeignKey("cash_transactions.id")
        ),
        sa.Column("source_currency", sa.String(3)),
        sa.Column("target_currency", sa.String(3)),
        sa.Column("fx_rate", sa.Numeric(20, 6)),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
    )

    # Create historical_prices table
    op.create_table(
        "historical_prices",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column(
            "symbol", sa.String(), sa.ForeignKey("securities.symbol"), nullable=False
        ),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("open", sa.Numeric(20, 6), nullable=False),
        sa.Column("high", sa.Numeric(20, 6), nullable=False),
        sa.Column("low", sa.Numeric(20, 6), nullable=False),
        sa.Column("close", sa.Numeric(20, 6), nullable=False),
        sa.Column("volume", sa.BigInteger(), nullable=False),
        sa.Column("adjusted_close", sa.Numeric(20, 6), nullable=False),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.UniqueConstraint("symbol", "date"),
    )

    # Create historical_fx_rates table
    op.create_table(
        "historical_fx_rates",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column("from_currency", sa.String(3), nullable=False),
        sa.Column("to_currency", sa.String(3), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("rate", sa.Numeric(20, 6), nullable=False),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.UniqueConstraint("from_currency", "to_currency", "date"),
    )

    # Create benchmarks table
    op.create_table(
        "benchmarks",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column("symbol", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
    )

    # Create benchmark_values table
    op.create_table(
        "benchmark_values",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column("benchmark_id", UUID, sa.ForeignKey("benchmarks.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("value", sa.Numeric(20, 6), nullable=False),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.UniqueConstraint("benchmark_id", "date"),
    )

    # Create portfolio_benchmarks table
    op.create_table(
        "portfolio_benchmarks",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("benchmark_id", UUID, sa.ForeignKey("benchmarks.id"), nullable=False),
        sa.Column("weight", sa.Numeric(5, 2), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date()),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
    )


def downgrade() -> None:
    # Drop tables in reverse order of creation to handle foreign key constraints
    op.drop_table("portfolio_benchmarks")
    op.drop_table("benchmark_values")
    op.drop_table("benchmarks")
    op.drop_table("historical_fx_rates")
    op.drop_table("historical_prices")
    op.drop_table("cash_transactions")
    op.drop_table("transactions")
    op.drop_table("holdings")
    op.drop_table("securities")
    op.drop_table("accounts")
    op.drop_table("users")

    # Drop uuid-ossp extension
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')
