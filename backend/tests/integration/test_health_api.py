def test_status_returns_online(client):
    response = client.get("/status")

    assert response.status_code == 200
    assert response.json() == {"status": "online"}


def test_unknown_route_returns_404(client):
    assert client.get("/rota-inexistente").status_code == 404


def test_status_rejects_post(client):
    assert client.post("/status").status_code == 405
