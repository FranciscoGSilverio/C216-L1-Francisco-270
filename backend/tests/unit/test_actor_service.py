import pytest

from app.schemas.actor import ActorCreate
from app.services import actor as actor_service


def make(name="Ana Souza", **extra):
    return ActorCreate(name=name, **extra)


def test_create_actor_assigns_distinct_ids(db_session):
    first = actor_service.create_actor(db_session, make("Ana"))
    second = actor_service.create_actor(db_session, make("Bia"))

    assert first.id != second.id


def test_create_actor_rejects_duplicate_name(db_session):
    actor_service.create_actor(db_session, make("Ana"))

    with pytest.raises(actor_service.DuplicateActorNameError):
        actor_service.create_actor(db_session, make("Ana"))


def test_get_actor_raises_when_missing(db_session):
    with pytest.raises(actor_service.ActorNotFoundError):
        actor_service.get_actor(db_session, 999)


def test_replace_actor_keeping_own_name_is_allowed(db_session):
    actor = actor_service.create_actor(db_session, make("Ana"))

    updated = actor_service.replace_actor(
        db_session, actor.id, make("Ana", nationality="Brasileira")
    )

    assert updated.nationality == "Brasileira"


def test_replace_actor_with_other_actor_name_is_rejected(db_session):
    actor_service.create_actor(db_session, make("Ana"))
    other = actor_service.create_actor(db_session, make("Bia"))

    with pytest.raises(actor_service.DuplicateActorNameError):
        actor_service.replace_actor(db_session, other.id, make("Ana"))


def test_replace_missing_actor_with_taken_name_raises_not_found(db_session):
    actor_service.create_actor(db_session, make("Ana"))

    with pytest.raises(actor_service.ActorNotFoundError):
        actor_service.replace_actor(db_session, 999, make("Ana"))


def test_delete_actor_removes_it(db_session):
    actor = actor_service.create_actor(db_session, make("Ana"))

    actor_service.delete_actor(db_session, actor.id)

    with pytest.raises(actor_service.ActorNotFoundError):
        actor_service.get_actor(db_session, actor.id)


def test_delete_missing_actor_raises(db_session):
    with pytest.raises(actor_service.ActorNotFoundError):
        actor_service.delete_actor(db_session, 999)


def test_list_actors_filters_by_partial_name_ignoring_case(db_session):
    actor_service.create_actor(db_session, make("Ana Souza"))
    actor_service.create_actor(db_session, make("Bruno"))

    names = [a.name for a in actor_service.list_actors(db_session, name="ANA")]

    assert names == ["Ana Souza"]


def test_list_actors_treats_percent_as_literal(db_session):
    actor_service.create_actor(db_session, make("Ana"))

    assert actor_service.list_actors(db_session, name="%") == []


def test_list_actors_is_ordered_by_name(db_session):
    actor_service.create_actor(db_session, make("Zeca"))
    actor_service.create_actor(db_session, make("Ana"))

    assert [a.name for a in actor_service.list_actors(db_session)] == ["Ana", "Zeca"]
