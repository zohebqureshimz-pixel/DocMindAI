"""add organization user id

Revision ID: 3e598aa8a9d9
Revises: e702c1559a5b
Create Date: 2026-09-26 04:18:44.579564

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e598aa8a9d9'
down_revision: Union[str, Sequence[str], None] = 'e702c1559a5b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # 1. Add the column temporarily as nullable
    op.add_column(
        "users",
        sa.Column(
            "organization_user_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # 2. Existing setup:
    #    Each organization currently has one admin,
    #    so every existing admin gets organization user ID 1.
    op.execute(
        """
        UPDATE users
        SET organization_user_id = 1
        WHERE organization_user_id IS NULL
        """
    )

    # 3. Make the column required
    op.alter_column(
        "users",
        "organization_user_id",
        nullable=False,
    )

    # 4. Prevent duplicate user IDs inside the same organization
    op.create_unique_constraint(
        "uq_users_organization_user_id",
        "users",
        ["organization_id", "organization_user_id"],
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "uq_users_organization_user_id",
        "users",
        type_="unique",
    )

    op.drop_column(
        "users",
        "organization_user_id",
    )
