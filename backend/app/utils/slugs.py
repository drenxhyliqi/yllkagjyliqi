import re
import unicodedata

from sqlalchemy import select
from sqlalchemy.orm import Session


def slugify(text: str) -> str:
    """"Make-up për nuse" -> "make-up-per-nuse"."""
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")
    return slug[:80].rstrip("-") or "item"


def unique_slug(db: Session, column, text: str) -> str:
    """A slug for `text` not yet used in `column`, adding -2, -3… when needed."""
    base = slugify(text)
    taken = set(db.scalars(select(column).where(column.like(f"{base}%"))))
    if base not in taken:
        return base
    number = 2
    while f"{base}-{number}" in taken:
        number += 1
    return f"{base}-{number}"
