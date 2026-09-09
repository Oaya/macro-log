"""add unit preference and sex and dob

Revision ID: f85f6301d4c1
Revises: 24d1e773cf08
Create Date: 2026-09-08 20:18:04.896504

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f85f6301d4c1"
down_revision: Union[str, Sequence[str], None] = "24d1e773cf08"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create the enum types FIRST
    unit_preference_enum = sa.Enum("METRIC", "IMPERIAL", name="unit_preference")
    unit_preference_enum.create(op.get_bind())

    sex_enum = sa.Enum("MALE", "FEMALE", name="sex")
    sex_enum.create(op.get_bind())

    # 2. THEN add the columns (using create_type=False so it doesn't try to
    # recreate the type)
    op.add_column(
        "users",
        sa.Column(
            "unit_preference",
            sa.Enum("METRIC", "IMPERIAL", name="unit_preference", create_type=False),
            server_default="METRIC",
            nullable=False,
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "sex",
            sa.Enum("MALE", "FEMALE", name="sex", create_type=False),
            nullable=True,
        ),
    )
    op.add_column("users", sa.Column("date_of_birth", sa.Date(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    op.drop_column("users", "date_of_birth")
    op.drop_column("users", "sex")
    op.drop_column("users", "unit_preference")

    # Drop the enum types
    sa.Enum(name="unit_preference").drop(op.get_bind())
    sa.Enum(name="sex").drop(op.get_bind())
    # ### end Alembic commands ###
