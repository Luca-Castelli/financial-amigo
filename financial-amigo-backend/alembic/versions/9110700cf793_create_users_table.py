"""Create users table

Revision ID: 9110700cf793
Revises: 
Create Date: 2025-01-18 21:54:44.954064

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "9110700cf793"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("image", sa.String(), nullable=True),
        sa.Column("email_verified", sa.Boolean(), nullable=False, default=False),
        sa.Column("provider", sa.String(), nullable=True),
        sa.Column("google_id", sa.String(), nullable=True),
        sa.Column(
            "default_currency",
            sa.String(length=3),
            nullable=False,
            server_default="CAD",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("google_id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
