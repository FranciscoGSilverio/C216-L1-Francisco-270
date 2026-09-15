import pytest
from fastapi.testclient import TestClient

from app.main import app, home, status


@pytest.fixture
def client():
    return TestClient(app)


def test_home_function_returns_greeting_message():
    assert home() == {"message": "Olá, Sistemas Distribuídos!"}


def test_status_function_returns_online():
    assert status() == {"status": "online"}


def test_home_endpoint_returns_200(client):
    response = client.get("/")

    assert response.status_code == 200


def test_status_endpoint_returns_200(client):
    response = client.get("/status")

    assert response.status_code == 200


@pytest.mark.parametrize(
    "path, expected_json",
    [
        ("/", {"message": "Olá, Sistemas Distribuídos!"}),
        ("/status", {"status": "online"}),
    ],
)
def test_endpoints_return_expected_json(client, path, expected_json):
    response = client.get(path)

    assert response.json() == expected_json


def test_unknown_endpoint_returns_404(client):
    response = client.get("/rota-inexistente")

    assert response.status_code == 404


def test_home_endpoint_rejects_post_method(client):
    response = client.post("/")

    assert response.status_code == 405
