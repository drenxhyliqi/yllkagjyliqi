# Importing the models registers every table on Base.metadata (used by Alembic).
from app.models.admin import Admin, AdminSession

__all__ = ["Admin", "AdminSession"]
