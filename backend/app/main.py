import re

import sentry_sdk
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, bookings, catalog, system, health, media, portfolio, schedule, settings as business
from app.core.config import get_settings
from app.core.exceptions import register_domain_errors, register_exception_handlers

settings = get_settings()

_PRIVATE_LINK = re.compile(r"(/manage/)[A-Za-z0-9_-]{16,}")


def _scrub(event, _hint):
    """The client's private booking link works like a password: never send it."""
    request = event.get("request") or {}
    if request.get("url"):
        request["url"] = _PRIVATE_LINK.sub(r"\1[hidden]", request["url"])
    if event.get("transaction"):
        event["transaction"] = _PRIVATE_LINK.sub(r"\1[hidden]", event["transaction"])
    return event


if settings.sentry_dsn:
    # Reports unexpected errors. No personal data (names, phones, request
    # bodies) is sent: bookings stay in our database only.
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        send_default_pii=False,
        max_request_body_size="never",
        traces_sample_rate=0.0,
        before_send=_scrub,
    )

app = FastAPI(
    title="Yllka API",
    # Interactive docs are for development only.
    docs_url=None if settings.is_production else "/api/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Client-IP"],
)

register_exception_handlers(app)
register_domain_errors(app)

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(schedule.public_router, prefix="/api")
app.include_router(schedule.admin_router, prefix="/api")
app.include_router(catalog.public_router, prefix="/api")
app.include_router(catalog.admin_router, prefix="/api")
app.include_router(portfolio.public_router, prefix="/api")
app.include_router(portfolio.admin_router, prefix="/api")
app.include_router(business.public_router, prefix="/api")
app.include_router(business.admin_router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(system.router, prefix="/api")
app.include_router(bookings.public_router, prefix="/api")
app.include_router(bookings.admin_router, prefix="/api")

# Uploaded photos. File names are random and never reused.
settings.media_root.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.media_root), name="media")
