from datetime import datetime, timedelta, timezone


def create(client, **overrides):
    payload = {"name": "Ana Souza", **overrides}
    return client.post("/actors", json=payload)


def test_create_actor_returns_201(client):
    response = create(client, birth_date="1990-05-01", nationality="Brasileira")

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Ana Souza"
    assert body["birth_date"] == "1990-05-01"
    assert body["nationality"] == "Brasileira"
    assert isinstance(body["id"], int)


def test_create_actor_with_blank_name_returns_422(client):
    assert create(client, name="   ").status_code == 422


def test_create_actor_with_future_birth_date_returns_422(client):
    future = (datetime.now(timezone.utc).date() + timedelta(days=1)).isoformat()

    assert create(client, birth_date=future).status_code == 422


def test_create_actor_with_duplicate_name_returns_409(client):
    create(client)

    response = create(client)

    assert response.status_code == 409
    assert response.json()["detail"] == "Já existe um ator com esse nome"


def test_get_missing_actor_returns_404(client):
    response = client.get("/actors/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Ator não encontrado"


def test_get_actor_returns_200(client):
    actor_id = create(client).json()["id"]

    response = client.get(f"/actors/{actor_id}")

    assert response.status_code == 200
    assert response.json()["name"] == "Ana Souza"


def test_put_actor_updates_fields(client):
    actor_id = create(client).json()["id"]

    response = client.put(
        f"/actors/{actor_id}", json={"name": "Ana Lima", "nationality": "Portuguesa"}
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Ana Lima"
    assert response.json()["nationality"] == "Portuguesa"


def test_put_actor_keeping_own_name_returns_200(client):
    actor_id = create(client).json()["id"]

    response = client.put(f"/actors/{actor_id}", json={"name": "Ana Souza"})

    assert response.status_code == 200


def test_put_actor_with_other_actor_name_returns_409(client):
    create(client, name="Ana")
    other_id = create(client, name="Bia").json()["id"]

    response = client.put(f"/actors/{other_id}", json={"name": "Ana"})

    assert response.status_code == 409


def test_put_missing_actor_with_taken_name_returns_404(client):
    create(client, name="Ana")

    response = client.put("/actors/999", json={"name": "Ana"})

    assert response.status_code == 404


def test_delete_actor_returns_204_then_404(client):
    actor_id = create(client).json()["id"]

    assert client.delete(f"/actors/{actor_id}").status_code == 204
    assert client.get(f"/actors/{actor_id}").status_code == 404


def test_delete_missing_actor_returns_404(client):
    assert client.delete("/actors/999").status_code == 404


def test_list_actors_filters_by_partial_name_ignoring_case(client):
    create(client, name="Ana Souza")
    create(client, name="Bruno")

    response = client.get("/actors", params={"name": "ANA"})

    assert [a["name"] for a in response.json()] == ["Ana Souza"]


def test_list_actors_percent_is_not_a_wildcard(client):
    create(client, name="Ana")

    assert client.get("/actors", params={"name": "%"}).json() == []


def test_list_actors_is_ordered_by_name(client):
    create(client, name="Zeca")
    create(client, name="Ana")

    assert [a["name"] for a in client.get("/actors").json()] == ["Ana", "Zeca"]
