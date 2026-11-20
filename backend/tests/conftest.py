import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

from app.database.base import Base
from app.database.session import SessionLocal, engine, get_db
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    Base.metadata.create_all(bind=engine)


@pytest.fixture
def db_session():
    session = SessionLocal()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    def _get_db_override():
        yield db_session

    app.dependency_overrides[get_db] = _get_db_override

    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.fixture(autouse=True)
def _clean_tables(db_session):
    _wipe(db_session)
    yield
    _wipe(db_session)


def _wipe(session):
    session.rollback()
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(delete(table))
    session.commit()
