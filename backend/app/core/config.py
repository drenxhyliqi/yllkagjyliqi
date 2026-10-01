import logging
from functools import lru_cache
from pathlib import Path
from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+psycopg://localhost:5432/yllka"
    # Origin of the Next.js site, allowed by CORS.
    frontend_origin: str = "http://localhost:3000"
    # Kosovo has no zone of its own in the IANA database; it is covered by
    # Europe/Belgrade (CET/CEST). "Europe/Pristina" does not exist.
    business_timezone: str = "Europe/Belgrade"
    # How long an admin stays signed in on a device.
    session_days: int = Field(default=14, ge=1, le=90)
    # Where uploaded photos go: "local" (disk, development) or "cloudinary".
    image_provider: Literal["local", "cloudinary"] = "local"
    # Local photos are kept here and served at /media.
    media_root: Path = Path("media")
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None
    # Folder in the Cloudinary media library.
    cloudinary_folder: str = "yllka"
    # The public website, for links in emails (e.g. https://yllka.com).
    site_url: str = "http://localhost:3000"
    # Emails through Resend (resend.com). Without a key, emails are only logged.
    resend_api_key: str | None = None
    # Sender, on a domain verified in Resend, e.g. "Yllka <termine@yllka.com>".
    email_from: str | None = None
    # Where new-request emails go (comma-separated). Default: every admin's email.
    notify_email: str | None = None
    # Error monitoring (sentry.io). Off when empty.
    sentry_dsn: str | None = None

    @field_validator("database_url")
    @classmethod
    def use_psycopg(cls, value: str) -> str:
        """Hosts such as Railway give "postgresql://…"; SQLAlchemy needs the driver named."""
        for prefix in ("postgres://", "postgresql://"):
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value.removeprefix(prefix)
        return value

    @field_validator("business_timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError(f"Unknown timezone: {value}") from exc
        return value

    @model_validator(mode="after")
    def production_storage(self) -> "Settings":
        if self.is_production and self.image_provider == "local":
            # Hosts like Railway wipe the disk on every deploy: uploads would vanish.
            logging.getLogger(__name__).warning(
                "IMAGE_PROVIDER=local in production: uploaded photos are lost on redeploy. "
                "Use IMAGE_PROVIDER=cloudinary."
            )
        return self

    @model_validator(mode="after")
    def cloudinary_complete(self) -> "Settings":
        if self.image_provider == "cloudinary" and not (
            self.cloudinary_cloud_name and self.cloudinary_api_key and self.cloudinary_api_secret
        ):
            raise ValueError(
                "IMAGE_PROVIDER=cloudinary needs CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY "
                "and CLOUDINARY_API_SECRET."
            )
        return self

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
