def test_create_item_returns_201(client):
    response = client.post("/items", json={"name": "Caneta"})

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Caneta"
    assert body["description"] is None
    assert "id" in body


def test_create_item_without_name_returns_422(client):
    response = client.post("/items", json={"description": "Sem nome"})

    assert response.status_code == 422


def test_list_items_returns_created_items(client):
    client.post("/items", json={"name": "Caneta"})
    client.post("/items", json={"name": "Caderno"})

    response = client.get("/items")

    assert response.status_code == 200
    assert [item["name"] for item in response.json()] == ["Caneta", "Caderno"]


def test_list_items_respects_limit_query_param(client):
    client.post("/items", json={"name": "Caneta"})
    client.post("/items", json={"name": "Caderno"})

    response = client.get("/items", params={"limit": 1})

    assert len(response.json()) == 1


def test_get_item_returns_200(client):
    created = client.post("/items", json={"name": "Caneta"}).json()

    response = client.get(f"/items/{created['id']}")

    assert response.status_code == 200
    assert response.json() == created


def test_get_item_returns_404_for_unknown_id(client):
    response = client.get("/items/999")

    assert response.status_code == 404


def test_put_item_replaces_item(client):
    created = client.post(
        "/items", json={"name": "Caneta", "description": "Azul"}
    ).json()

    response = client.put(f"/items/{created['id']}", json={"name": "Lápis"})

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Lápis"
    assert body["description"] is None


def test_put_item_returns_404_for_unknown_id(client):
    response = client.put("/items/999", json={"name": "Lápis"})

    assert response.status_code == 404


def test_patch_item_updates_only_provided_fields(client):
    created = client.post(
        "/items", json={"name": "Caneta", "description": "Azul"}
    ).json()

    response = client.patch(f"/items/{created['id']}", json={"description": "Vermelha"})

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Caneta"
    assert body["description"] == "Vermelha"


def test_patch_item_returns_404_for_unknown_id(client):
    response = client.patch("/items/999", json={"description": "Vermelha"})

    assert response.status_code == 404


def test_delete_item_returns_204(client):
    created = client.post("/items", json={"name": "Caneta"}).json()

    response = client.delete(f"/items/{created['id']}")

    assert response.status_code == 204
    assert client.get(f"/items/{created['id']}").status_code == 404


def test_delete_item_returns_404_for_unknown_id(client):
    response = client.delete("/items/999")

    assert response.status_code == 404
