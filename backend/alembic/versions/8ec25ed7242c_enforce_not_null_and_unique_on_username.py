"""enforce not null and unique on username

Revision ID: 8ec25ed7242c
Revises: d76fe68f3ce5
Create Date: 2026-09-18 19:12:59.743635

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8ec25ed7242c"
down_revision: Union[str, Sequence[str], None] = "d76fe68f3ce5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("users", "username", nullable=False)
    op.create_unique_constraint("uq_users_username", "users", ["username"])


def downgrade() -> None:
    op.drop_constraint("uq_users_username", "users", type_="unique")
    op.alter_column("users", "username", nullable=True)
