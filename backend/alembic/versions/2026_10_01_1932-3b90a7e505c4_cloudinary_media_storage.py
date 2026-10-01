"""cloudinary media storage

Revision ID: 3b90a7e505c4
Revises: 7abf65d7bffa
Create Date: 2026-10-01 19:32:10.457100

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3b90a7e505c4'
down_revision: Union[str, Sequence[str], None] = '7abf65d7bffa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _storage_rule(values: str) -> None:
    op.drop_constraint(op.f("ck_media_assets_storage"), "media_assets", type_="check")
    op.create_check_constraint(op.f("ck_media_assets_storage"), "media_assets", f"storage IN ({values})")


def upgrade() -> None:
    """Photos can also live on Cloudinary."""
    _storage_rule("'local', 'cloudinary', 'external'")


def downgrade() -> None:
    """Fails if any photo is already on Cloudinary."""
    _storage_rule("'local', 'external'")
