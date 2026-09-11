"""Update Goal

Revision ID: 2c59a6bd2f81
Revises: 81d4dfa2dd3e
Create Date: 2026-09-11 20:26:34.757902

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2c59a6bd2f81"
down_revision: Union[str, Sequence[str], None] = "81d4dfa2dd3e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


activity_level_enum = sa.Enum(
    "SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", name="activity_level"
)


def upgrade() -> None:
    """Upgrade schema."""
    activity_level_enum.create(op.get_bind(), checkfirst=True)
    op.add_column("goals", sa.Column("target_weight_kg", sa.Float(), nullable=True))
    op.add_column("goals", sa.Column("target_date", sa.Date(), nullable=True))
    op.add_column(
        "goals",
        sa.Column("activity_level", activity_level_enum, nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("goals", "activity_level")
    op.drop_column("goals", "target_date")
    op.drop_column("goals", "target_weight_kg")
    activity_level_enum.drop(op.get_bind(), checkfirst=True)
