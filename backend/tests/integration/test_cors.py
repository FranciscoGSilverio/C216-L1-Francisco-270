import pytest

from app.core.config import parse_cors_origins


def test_preflight_from_allowed_origin_returns_allow_origin_header(client):
    response = client.options(
        "/items",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_response_from_disallowed_origin_has_no_allow_origin_header(client):
    response = client.get("/items", headers={"Origin": "http://evil.example"})

    assert "access-control-allow-origin" not in response.headers


def test_wildcard_origin_is_rejected():
    with pytest.raises(ValueError):
        parse_cors_origins("http://localhost:5173,*")


def test_parse_cors_origins_strips_spaces_and_empty_values():
    assert parse_cors_origins(" http://a.com, ,http://b.com,") == [
        "http://a.com",
        "http://b.com",
    ]
