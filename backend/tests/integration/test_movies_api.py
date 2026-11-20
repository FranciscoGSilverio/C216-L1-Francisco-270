from datetime import datetime, timezone


def create(client, **overrides):
    payload = {"title": "Cidade de Deus", "year": 2002, **overrides}
    return client.post("/movies", json=payload)


def test_create_movie_returns_201(client):
    response = create(client, genre="Drama", synopsis="Rio de Janeiro")

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Cidade de Deus"
    assert body["year"] == 2002
    assert body["genre"] == "Drama"
    assert body["synopsis"] == "Rio de Janeiro"


def test_create_movie_with_blank_title_returns_422(client):
    assert create(client, title="  ").status_code == 422


def test_create_movie_with_year_before_1888_returns_422(client):
    assert create(client, year=1887).status_code == 422


def test_create_movie_with_year_too_far_in_future_returns_422(client):
    far = datetime.now(timezone.utc).year + 6

    assert create(client, year=far).status_code == 422


def test_create_movie_with_same_title_and_year_returns_409(client):
    create(client)

    response = create(client)

    assert response.status_code == 409
    assert response.json()["detail"] == "Já existe um filme com esse título e ano"


def test_create_movie_with_same_title_and_other_year_returns_201(client):
    create(client)

    assert create(client, year=2003).status_code == 201


def test_get_missing_movie_returns_404(client):
    response = client.get("/movies/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Filme não encontrado"


def test_get_movie_returns_200(client):
    movie_id = create(client).json()["id"]

    assert client.get(f"/movies/{movie_id}").json()["title"] == "Cidade de Deus"


def test_put_movie_updates_fields(client):
    movie_id = create(client).json()["id"]

    response = client.put(
        f"/movies/{movie_id}", json={"title": "Central do Brasil", "year": 1998}
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Central do Brasil"


def test_put_movie_keeping_own_values_returns_200(client):
    movie_id = create(client).json()["id"]

    response = client.put(
        f"/movies/{movie_id}",
        json={"title": "Cidade de Deus", "year": 2002, "genre": "Drama"},
    )

    assert response.status_code == 200


def test_put_movie_with_taken_title_and_year_returns_409(client):
    create(client, title="A", year=2000)
    other_id = create(client, title="B", year=2001).json()["id"]

    response = client.put(f"/movies/{other_id}", json={"title": "A", "year": 2000})

    assert response.status_code == 409


def test_put_missing_movie_with_taken_values_returns_404(client):
    create(client, title="A", year=2000)

    response = client.put("/movies/999", json={"title": "A", "year": 2000})

    assert response.status_code == 404


def test_delete_movie_returns_204_then_404(client):
    movie_id = create(client).json()["id"]

    assert client.delete(f"/movies/{movie_id}").status_code == 204
    assert client.get(f"/movies/{movie_id}").status_code == 404


def test_delete_missing_movie_returns_404(client):
    assert client.delete("/movies/999").status_code == 404


def test_list_movies_filters_by_partial_title_ignoring_case(client):
    create(client, title="Cidade de Deus")
    create(client, title="Central do Brasil", year=1998)

    response = client.get("/movies", params={"title": "CIDADE"})

    assert [m["title"] for m in response.json()] == ["Cidade de Deus"]


def test_list_movies_percent_is_not_a_wildcard(client):
    create(client)

    assert client.get("/movies", params={"title": "%"}).json() == []


def test_list_movies_is_ordered_by_title_then_year(client):
    create(client, title="B", year=2000)
    create(client, title="A", year=2010)
    create(client, title="A", year=1990)

    result = [(m["title"], m["year"]) for m in client.get("/movies").json()]

    assert result == [("A", 1990), ("A", 2010), ("B", 2000)]
