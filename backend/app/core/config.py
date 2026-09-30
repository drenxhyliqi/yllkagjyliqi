from functools import lru_cache
from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import Field, field_validator
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

    @field_validator("business_timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError(f"Unknown timezone: {value}") from exc
        return value

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
