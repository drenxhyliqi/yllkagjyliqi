import uuid

from fastapi import APIRouter, Response, status

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.category import CategoryAdminOut, CategoryIn, PublicCategoryWithServices
from app.schemas.common import ReorderIn
from app.schemas.service import ServiceAdminOut, ServiceIn
from app.services import catalog_service
from app.services.localize import Locale

public_router = APIRouter(tags=["catalog"])
admin_router = APIRouter(prefix="/admin", tags=["admin: services"])

NO_CONTENT = Response(status_code=status.HTTP_204_NO_CONTENT)


@public_router.get("/catalog")
def public_catalog(db: DbSession, locale: Locale = "sq") -> list[PublicCategoryWithServices]:
    """Active categories with their active services, for the services and prices pages."""
    return catalog_service.public_catalog(db, locale)


@admin_router.get("/catalog")
def admin_catalog(_: CurrentAdmin, db: DbSession) -> list[CategoryAdminOut]:
    """Every category with every service, hidden ones included."""
    return catalog_service.admin_catalog(db)


@admin_router.post("/categories", status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryIn, _: CurrentAdmin, db: DbSession) -> dict[str, uuid.UUID]:
    return {"id": catalog_service.create_category(db, data).id}


@admin_router.put("/categories/{category_id}")
def update_category(
    category_id: uuid.UUID, data: CategoryIn, _: CurrentAdmin, db: DbSession
) -> dict[str, uuid.UUID]:
    return {"id": catalog_service.update_category(db, category_id, data).id}


@admin_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: uuid.UUID, _: CurrentAdmin, db: DbSession) -> Response:
    catalog_service.delete_category(db, category_id)
    return NO_CONTENT


@admin_router.put("/categories-order", status_code=status.HTTP_204_NO_CONTENT)
def reorder_categories(data: ReorderIn, _: CurrentAdmin, db: DbSession) -> Response:
    catalog_service.reorder_categories(db, data.ids)
    return NO_CONTENT


@admin_router.post("/services", status_code=status.HTTP_201_CREATED)
def create_service(data: ServiceIn, _: CurrentAdmin, db: DbSession) -> ServiceAdminOut:
    return ServiceAdminOut.model_validate(catalog_service.create_service(db, data))


@admin_router.put("/services/{service_id}")
def update_service(
    service_id: uuid.UUID, data: ServiceIn, _: CurrentAdmin, db: DbSession
) -> ServiceAdminOut:
    return ServiceAdminOut.model_validate(catalog_service.update_service(db, service_id, data))


@admin_router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: uuid.UUID, _: CurrentAdmin, db: DbSession) -> Response:
    catalog_service.delete_service(db, service_id)
    return NO_CONTENT


@admin_router.put("/categories/{category_id}/services-order", status_code=status.HTTP_204_NO_CONTENT)
def reorder_services(
    category_id: uuid.UUID, data: ReorderIn, _: CurrentAdmin, db: DbSession
) -> Response:
    catalog_service.reorder_services(db, category_id, data.ids)
    return NO_CONTENT
