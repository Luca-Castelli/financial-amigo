"""create initial tables

Revision ID: dbe4680883eb
Revises: None
Create Date: 2024-01-22 01:28:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from app.models.account import AccountType, Currency
from app.models.transaction import TransactionType
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
            "default_currency",
            sa.Enum(
                Currency, name="currency", create_constraint=True, native_enum=True
            ),
            nullable=False,
            server_default=Currency.CAD.value,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
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
        sa.Column(
            "user_id",
            UUID,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "type",
            sa.Enum(
                AccountType,
                name="account_type",
                create_constraint=True,
                native_enum=True,
            ),
            nullable=False,
        ),
        sa.Column(
            "currency",
            sa.Enum(
                Currency, name="currency", create_constraint=True, native_enum=True
            ),
            nullable=False,
            server_default=Currency.CAD.value,
        ),
        sa.Column("broker", sa.String()),
        sa.Column("account_number", sa.String()),
        sa.Column("cash_balance", sa.Float(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    # Create transactions table
    op.create_table(
        "transactions",
        sa.Column(
            "id", UUID, primary_key=True, server_default=sa.text("uuid_generate_v4()")
        ),
        sa.Column(
            "account_id",
            UUID,
            sa.ForeignKey("accounts.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("symbol", sa.String(), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False, server_default="0"),
        sa.Column("price_native", sa.Float(), nullable=False),
        sa.Column("commission_native", sa.Float(), nullable=False, server_default="0"),
        sa.Column(
            "currency",
            sa.Enum(
                Currency, name="currency", create_constraint=True, native_enum=True
            ),
            nullable=False,
            server_default=Currency.CAD.value,
        ),
        sa.Column(
            "type",
            sa.Enum(
                TransactionType,
                name="transaction_type",
                create_constraint=True,
                native_enum=True,
            ),
            nullable=False,
        ),
        sa.Column("description", sa.String()),
        sa.Column("total_native", sa.Float(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )


def downgrade() -> None:
    op.drop_table("transactions")
    op.drop_table("accounts")
    op.drop_table("users")

    # Drop enum types - they will be automatically dropped with native_enum=True
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')
