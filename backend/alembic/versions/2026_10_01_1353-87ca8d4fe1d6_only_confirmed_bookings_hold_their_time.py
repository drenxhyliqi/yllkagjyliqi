"""only confirmed bookings hold their time

Revision ID: 87ca8d4fe1d6
Revises: 7569872dba26
Create Date: 2026-10-01 13:53:18.340888

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '87ca8d4fe1d6'
down_revision: Union[str, Sequence[str], None] = '7569872dba26'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _overlap_rule(statuses: str) -> None:
    op.execute("ALTER TABLE bookings DROP CONSTRAINT ex_bookings_no_overlap")
    op.execute(
        "ALTER TABLE bookings ADD CONSTRAINT ex_bookings_no_overlap "
        "EXCLUDE USING gist (tstzrange(start_time, end_time, '[)') WITH &&) "
        f"WHERE (status IN ({statuses}))"
    )


def upgrade() -> None:
    """Pending requests may overlap; only confirmed bookings can't."""
    _overlap_rule("'confirmed'")


def downgrade() -> None:
    """Back to pending requests holding their time too (fails if requests overlap)."""
    _overlap_rule("'pending', 'confirmed'")
