import pytest

from app.schemas.actor import ActorCreate
from app.schemas.cast import CastCreate, CastUpdate
from app.schemas.movie import MovieCreate
from app.services import actor as actor_service
from app.services import cast as cast_service
from app.services import movie as movie_service


@pytest.fixture
def movie(db_session):
    return movie_service.create_movie(
        db_session, MovieCreate(title="Cidade de Deus", year=2002)
    )


@pytest.fixture
def actor(db_session):
    return actor_service.create_actor(db_session, ActorCreate(name="Ana"))


def test_add_member_links_actor_to_movie(db_session, movie, actor):
    member = cast_service.add_member(
        db_session, movie.id, CastCreate(actor_id=actor.id, character="Buscapé")
    )

    assert member.actor_name == "Ana"
    assert member.character == "Buscapé"


def test_add_member_rejects_duplicate_link(db_session, movie, actor):
    data = CastCreate(actor_id=actor.id, character="Buscapé")
    cast_service.add_member(db_session, movie.id, data)

    with pytest.raises(cast_service.DuplicateCastError):
        cast_service.add_member(db_session, movie.id, data)


def test_add_member_requires_existing_movie(db_session, actor):
    with pytest.raises(movie_service.MovieNotFoundError):
        cast_service.add_member(
            db_session, 999, CastCreate(actor_id=actor.id, character="X")
        )


def test_add_member_requires_existing_actor(db_session, movie):
    with pytest.raises(actor_service.ActorNotFoundError):
        cast_service.add_member(
            db_session, movie.id, CastCreate(actor_id=999, character="X")
        )


def test_update_member_changes_only_the_character(db_session, movie, actor):
    cast_service.add_member(
        db_session, movie.id, CastCreate(actor_id=actor.id, character="Buscapé")
    )

    member = cast_service.update_member(
        db_session, movie.id, actor.id, CastUpdate(character="Zé Pequeno")
    )

    assert member.character == "Zé Pequeno"
    assert member.actor_id == actor.id


def test_update_member_raises_when_link_does_not_exist(db_session, movie, actor):
    with pytest.raises(cast_service.CastNotFoundError):
        cast_service.update_member(
            db_session, movie.id, actor.id, CastUpdate(character="X")
        )


def test_remove_member_keeps_movie_and_actor(db_session, movie, actor):
    cast_service.add_member(
        db_session, movie.id, CastCreate(actor_id=actor.id, character="X")
    )

    cast_service.remove_member(db_session, movie.id, actor.id)

    assert movie_service.get_movie_detail(db_session, movie.id).cast == []
    assert actor_service.get_actor(db_session, actor.id).name == "Ana"


def test_remove_member_raises_when_link_does_not_exist(db_session, movie, actor):
    with pytest.raises(cast_service.CastNotFoundError):
        cast_service.remove_member(db_session, movie.id, actor.id)


def test_movie_detail_lists_cast_ordered_by_actor_name(db_session, movie):
    zeca = actor_service.create_actor(db_session, ActorCreate(name="Zeca"))
    ana = actor_service.create_actor(db_session, ActorCreate(name="Ana"))
    for a in (zeca, ana):
        cast_service.add_member(
            db_session, movie.id, CastCreate(actor_id=a.id, character="X")
        )

    detail = movie_service.get_movie_detail(db_session, movie.id)

    assert [m.actor_name for m in detail.cast] == ["Ana", "Zeca"]
