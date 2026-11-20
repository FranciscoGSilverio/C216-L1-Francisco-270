from sqlalchemy import select

from app.models import Actor, Movie, MovieActor


def make_movie(client, title="Cidade de Deus", year=2002):
    return client.post("/movies", json={"title": title, "year": year}).json()["id"]


def make_actor(client, name="Ana Souza"):
    return client.post("/actors", json={"name": name}).json()["id"]


def link(client, movie_id, actor_id, character="Buscapé"):
    return client.post(
        f"/movies/{movie_id}/cast",
        json={"actor_id": actor_id, "character": character},
    )


def test_link_returns_201_and_shows_in_movie_detail(client):
    movie_id, actor_id = make_movie(client), make_actor(client)

    response = link(client, movie_id, actor_id)

    assert response.status_code == 201
    detail = client.get(f"/movies/{movie_id}").json()
    assert detail["cast"] == [
        {"actor_id": actor_id, "actor_name": "Ana Souza", "character": "Buscapé"}
    ]


def test_movie_without_cast_has_empty_cast(client):
    movie_id = make_movie(client)

    assert client.get(f"/movies/{movie_id}").json()["cast"] == []


def test_duplicate_link_returns_409(client):
    movie_id, actor_id = make_movie(client), make_actor(client)
    link(client, movie_id, actor_id)

    response = link(client, movie_id, actor_id, "Outro")

    assert response.status_code == 409
    assert response.json()["detail"] == "Este ator já está no elenco deste filme"


def test_link_with_missing_actor_returns_404(client):
    movie_id = make_movie(client)

    response = link(client, movie_id, 999)

    assert response.status_code == 404
    assert response.json()["detail"] == "Ator não encontrado"


def test_link_with_missing_movie_returns_404(client):
    actor_id = make_actor(client)

    response = link(client, 999, actor_id)

    assert response.status_code == 404
    assert response.json()["detail"] == "Filme não encontrado"


def test_link_with_blank_character_returns_422(client):
    movie_id, actor_id = make_movie(client), make_actor(client)

    assert link(client, movie_id, actor_id, "  ").status_code == 422


def test_put_changes_only_the_character(client):
    movie_id, actor_id = make_movie(client), make_actor(client)
    link(client, movie_id, actor_id)

    response = client.put(
        f"/movies/{movie_id}/cast/{actor_id}", json={"character": "Zé Pequeno"}
    )

    assert response.status_code == 200
    assert response.json()["character"] == "Zé Pequeno"
    assert response.json()["actor_id"] == actor_id


def test_put_on_missing_link_returns_404(client):
    movie_id, actor_id = make_movie(client), make_actor(client)

    response = client.put(
        f"/movies/{movie_id}/cast/{actor_id}", json={"character": "X"}
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Vínculo não encontrado"


def test_delete_link_keeps_actor_and_movie(client):
    movie_id, actor_id = make_movie(client), make_actor(client)
    link(client, movie_id, actor_id)

    response = client.delete(f"/movies/{movie_id}/cast/{actor_id}")

    assert response.status_code == 204
    assert client.get(f"/movies/{movie_id}").json()["cast"] == []
    assert client.get(f"/actors/{actor_id}").status_code == 200


def test_delete_missing_link_returns_404(client):
    movie_id, actor_id = make_movie(client), make_actor(client)

    assert client.delete(f"/movies/{movie_id}/cast/{actor_id}").status_code == 404


def test_deleting_movie_removes_links_but_keeps_actors(client, db_session):
    movie_id, actor_id = make_movie(client), make_actor(client)
    link(client, movie_id, actor_id)

    assert client.delete(f"/movies/{movie_id}").status_code == 204

    db_session.expire_all()
    assert db_session.scalars(select(MovieActor)).all() == []
    assert db_session.get(Actor, actor_id) is not None


def test_deleting_actor_removes_links_but_keeps_movies(client, db_session):
    movie_id, actor_id = make_movie(client), make_actor(client)
    link(client, movie_id, actor_id)

    assert client.delete(f"/actors/{actor_id}").status_code == 204

    db_session.expire_all()
    assert db_session.scalars(select(MovieActor)).all() == []
    assert db_session.get(Movie, movie_id) is not None


def test_many_to_many_between_actors_and_movies(client):
    m1, m2 = make_movie(client, "A", 2000), make_movie(client, "B", 2001)
    a1, a2 = make_actor(client, "Ana"), make_actor(client, "Bia")
    for movie_id in (m1, m2):
        for actor_id in (a1, a2):
            assert link(client, movie_id, actor_id).status_code == 201

    assert len(client.get(f"/movies/{m1}").json()["cast"]) == 2
    assert len(client.get(f"/movies/{m2}").json()["cast"]) == 2


def test_list_movies_filters_by_actor(client):
    m1, m2 = make_movie(client, "A", 2000), make_movie(client, "B", 2001)
    a1, a2 = make_actor(client, "Ana"), make_actor(client, "Bia")
    link(client, m1, a1)
    link(client, m2, a2)

    response = client.get("/movies", params={"actor_id": a1})

    assert [m["title"] for m in response.json()] == ["A"]
