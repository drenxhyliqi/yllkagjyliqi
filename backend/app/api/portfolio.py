import uuid

from fastapi import APIRouter, Response, status

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.common import ReorderIn
from app.schemas.portfolio import PortfolioAdminOut, PortfolioIn, PublicPortfolioItem
from app.services import portfolio_service
from app.services.localize import Locale

public_router = APIRouter(prefix="/portfolio", tags=["portfolio"])
admin_router = APIRouter(prefix="/admin/portfolio", tags=["admin: portfolio"])


@public_router.get("")
def public_list(db: DbSession, locale: Locale = "sq") -> list[PublicPortfolioItem]:
    """Published work with at least one photo, in gallery order."""
    return portfolio_service.public_list(db, locale)


@public_router.get("/{slug}")
def public_item(slug: str, db: DbSession, locale: Locale = "sq") -> PublicPortfolioItem:
    return portfolio_service.public_get(db, slug, locale)


@admin_router.get("")
def admin_list(_: CurrentAdmin, db: DbSession) -> list[PortfolioAdminOut]:
    return portfolio_service.admin_list(db)


@admin_router.get("/{item_id}")
def admin_item(item_id: uuid.UUID, _: CurrentAdmin, db: DbSession) -> PortfolioAdminOut:
    return portfolio_service.admin_get(db, item_id)


@admin_router.post("", status_code=status.HTTP_201_CREATED)
def create(data: PortfolioIn, _: CurrentAdmin, db: DbSession) -> PortfolioAdminOut:
    return portfolio_service.create(db, data)


@admin_router.put("/{item_id}")
def update(item_id: uuid.UUID, data: PortfolioIn, _: CurrentAdmin, db: DbSession) -> PortfolioAdminOut:
    return portfolio_service.update(db, item_id, data)


@admin_router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(item_id: uuid.UUID, _: CurrentAdmin, db: DbSession) -> Response:
    portfolio_service.delete(db, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@admin_router.put("-order", status_code=status.HTTP_204_NO_CONTENT)
def reorder(data: ReorderIn, _: CurrentAdmin, db: DbSession) -> Response:
    portfolio_service.reorder(db, data.ids)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
