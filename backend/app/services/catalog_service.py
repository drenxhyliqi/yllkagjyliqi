"""Categories and their services."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import ConflictError, InvalidInputError, NotFoundError
from app.models import Category, PortfolioItem, Service
from app.schemas.category import (
    CategoryAdminOut,
    CategoryIn,
    PublicCategory,
    PublicCategoryWithServices,
)
from app.schemas.service import PublicService, ServiceIn
from app.services import media_service
from app.services.localize import Locale, pick, pick_optional, public_image
from app.utils.slugs import unique_slug


def _categories(db: Session) -> list[Category]:
    return list(
        db.scalars(
            select(Category).options(selectinload(Category.services)).order_by(Category.sort_order)
        ).unique()
    )


def _get_category(db: Session, category_id: uuid.UUID) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise NotFoundError("That category no longer exists.")
    return category


def _get_service(db: Session, service_id: uuid.UUID) -> Service:
    service = db.get(Service, service_id)
    if service is None:
        raise NotFoundError("That service no longer exists.")
    return service


def _set_image(db: Session, category: Category, image_id: uuid.UUID | None) -> None:
    if image_id == category.image_id:
        return
    old = category.image
    category.image = media_service.get_many(db, [image_id])[0] if image_id else None
    if old is not None:
        db.flush()
        media_service.release(db, old)


# ——— Admin ———


def admin_catalog(db: Session) -> list[CategoryAdminOut]:
    work_counts = dict(
        db.execute(
            select(PortfolioItem.category_id, func.count())
            .where(PortfolioItem.category_id.is_not(None))
            .group_by(PortfolioItem.category_id)
        ).all()
    )
    return [
        CategoryAdminOut.model_validate(category).model_copy(
            update={"work_count": work_counts.get(category.id, 0)}
        )
        for category in _categories(db)
    ]


def create_category(db: Session, data: CategoryIn) -> Category:
    last = db.scalar(select(func.max(Category.sort_order))) or 0
    category = Category(
        slug=unique_slug(db, Category.slug, data.name_en or data.name_sq),
        sort_order=last + 1,
        **data.model_dump(exclude={"image_id"}),
    )
    db.add(category)
    _set_image(db, category, data.image_id)
    db.commit()
    return category


def update_category(db: Session, category_id: uuid.UUID, data: CategoryIn) -> Category:
    category = _get_category(db, category_id)
    for field, value in data.model_dump(exclude={"image_id"}).items():
        setattr(category, field, value)
    _set_image(db, category, data.image_id)
    db.commit()
    return category


def delete_category(db: Session, category_id: uuid.UUID) -> None:
    category = _get_category(db, category_id)
    if category.services:
        raise ConflictError("This category still has services. Move or delete them first.")
    if db.scalar(select(func.count()).where(PortfolioItem.category_id == category_id)):
        raise ConflictError("Some work is still in this category. Move it to another category first.")
    image = category.image
    db.delete(category)
    if image is not None:
        db.flush()
        media_service.release(db, image)
    db.commit()


def _apply_order(rows: list, ids: list[uuid.UUID]) -> None:
    by_id = {row.id: row for row in rows}
    if set(ids) != set(by_id) or len(ids) != len(by_id):
        raise InvalidInputError("The list has changed in the meantime. Please reload and try again.")
    for position, row_id in enumerate(ids):
        by_id[row_id].sort_order = position


def reorder_categories(db: Session, ids: list[uuid.UUID]) -> None:
    _apply_order(list(db.scalars(select(Category))), ids)
    db.commit()


def create_service(db: Session, data: ServiceIn) -> Service:
    _get_category(db, data.category_id)
    last = db.scalar(
        select(func.max(Service.sort_order)).where(Service.category_id == data.category_id)
    )
    service = Service(
        slug=unique_slug(db, Service.slug, data.name_en or data.name_sq),
        sort_order=(last or 0) + 1,
        **data.model_dump(),
    )
    db.add(service)
    db.commit()
    return service


def update_service(db: Session, service_id: uuid.UUID, data: ServiceIn) -> Service:
    service = _get_service(db, service_id)
    if data.category_id != service.category_id:
        _get_category(db, data.category_id)
        # Moved services go to the end of their new category.
        last = db.scalar(
            select(func.max(Service.sort_order)).where(Service.category_id == data.category_id)
        )
        service.sort_order = (last or 0) + 1
    for field, value in data.model_dump().items():
        setattr(service, field, value)
    db.commit()
    return service


def delete_service(db: Session, service_id: uuid.UUID) -> None:
    db.delete(_get_service(db, service_id))
    db.commit()


def reorder_services(db: Session, category_id: uuid.UUID, ids: list[uuid.UUID]) -> None:
    category = _get_category(db, category_id)
    _apply_order(list(category.services), ids)
    db.commit()


# ——— Public ———


def _public_category(category: Category, locale: Locale) -> PublicCategory:
    name = pick(category.name_sq, category.name_en, locale)
    return PublicCategory(
        id=category.id,
        slug=category.slug,
        name=name,
        description=pick_optional(category.description_sq, category.description_en, locale),
        image=public_image(category.image, name) if category.image else None,
    )


def public_catalog(db: Session, locale: Locale) -> list[PublicCategoryWithServices]:
    """Active categories with their active services, in display order."""
    return [
        PublicCategoryWithServices(
            **_public_category(category, locale).model_dump(),
            services=[
                PublicService(
                    id=service.id,
                    slug=service.slug,
                    name=pick(service.name_sq, service.name_en, locale),
                    description=pick_optional(service.description_sq, service.description_en, locale),
                    price=service.price,
                    price_type=service.price_type,
                    duration_minutes=service.duration_minutes,
                )
                for service in category.services
                if service.is_active
            ],
        )
        for category in _categories(db)
        if category.is_active
    ]
