"""
Loads DEMO content for development: placeholder categories, services, prices,
stock photos (Unsplash, linked rather than stored) and contact details.

None of it is Yllka's real content. It is refused in production, and only
loads into an empty catalog so it can never overwrite real data.
"""

import json
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Category, MediaAsset, PortfolioImage, PortfolioItem, Service
from app.services import settings_service

DATA = Path(__file__).with_name("seed_data.json")


def _external_image(image: dict) -> MediaAsset:
    return MediaAsset(storage="external", url=image["url"], width=image["width"], height=image["height"])


def seed_demo(db: Session) -> str:
    if get_settings().is_production:
        raise SystemExit("Demo data must never be loaded in production.")
    if db.scalar(select(func.count()).select_from(Category)):
        raise SystemExit("The catalog already has content; demo data was not loaded.")

    data = json.loads(DATA.read_text(encoding="utf-8"))
    categories: dict[str, Category] = {}
    for position, entry in enumerate(data["categories"]):
        services = entry.pop("services")
        image = entry.pop("image")
        category = Category(**entry, sort_order=position, image=_external_image(image) if image else None)
        category.services = [Service(**service, sort_order=i) for i, service in enumerate(services)]
        categories[category.slug] = category
        db.add(category)

    for position, entry in enumerate(data["portfolio"]):
        image = entry.pop("image")
        category = categories.get(entry.pop("category"))
        item = PortfolioItem(**entry, category=category, sort_order=position)
        item.images = [PortfolioImage(media=_external_image(image), sort_order=0)]
        db.add(item)

    settings = settings_service.get(db)
    for field, value in data["business"].items():
        setattr(settings, field, value)

    db.commit()
    services = sum(len(c.services) for c in categories.values())
    return f"Loaded demo data: {len(categories)} categories, {services} services, {len(data['portfolio'])} portfolio items."
