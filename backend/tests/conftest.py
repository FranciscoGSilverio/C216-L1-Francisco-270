import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.item import repository


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def _reset_items_repository():
    repository.reset()
    yield
    repository.reset()
