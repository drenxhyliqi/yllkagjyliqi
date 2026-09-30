import os

from sqlalchemy.engine import make_url

from app.core.config import Settings

# Point the app at a separate "<name>_test" database before the engine is created.
_url = make_url(Settings().database_url)
os.environ["DATABASE_URL"] = _url.set(database=f"{_url.database}_test").render_as_string(
    hide_password=False
)
os.environ["ENVIRONMENT"] = "test"

from collections.abc import Iterator  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

import app.models  # noqa: E402, F401
from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.services.auth_service import login_throttle  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def schema() -> Iterator[None]:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture(autouse=True)
def clean_tables() -> Iterator[None]:
    yield
    with engine.begin() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())
    login_throttle._failures.clear()


@pytest.fixture
def db() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
