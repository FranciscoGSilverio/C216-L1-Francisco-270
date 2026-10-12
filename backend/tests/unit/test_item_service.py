import pytest

from app.schemas.item import ItemCreate, ItemUpdate
from app.services import item as item_service


def test_create_item_assigns_incremental_id(db_session):
    first = item_service.create_item(db_session, ItemCreate(name="Caneta"))
    second = item_service.create_item(db_session, ItemCreate(name="Caderno"))

    assert first.id != second.id


def test_list_items_returns_created_items(db_session):
    item_service.create_item(db_session, ItemCreate(name="Caneta"))
    item_service.create_item(db_session, ItemCreate(name="Caderno"))

    items = item_service.list_items(db_session)

    assert sorted(item.name for item in items) == ["Caderno", "Caneta"]


def test_list_items_respects_limit(db_session):
    item_service.create_item(db_session, ItemCreate(name="Caneta"))
    item_service.create_item(db_session, ItemCreate(name="Caderno"))

    items = item_service.list_items(db_session, limit=1)

    assert len(items) == 1


def test_get_item_returns_existing_item(db_session):
    created = item_service.create_item(db_session, ItemCreate(name="Caneta"))

    found = item_service.get_item(db_session, created.id)

    assert found.id == created.id
    assert found.name == "Caneta"


def test_get_item_raises_for_unknown_id(db_session):
    with pytest.raises(item_service.ItemNotFoundError):
        item_service.get_item(db_session, 999)


def test_replace_item_overwrites_fields(db_session):
    created = item_service.create_item(
        db_session, ItemCreate(name="Caneta", description="Azul")
    )

    replaced = item_service.replace_item(
        db_session, created.id, ItemCreate(name="Lápis")
    )

    assert replaced.name == "Lápis"
    assert replaced.description is None


def test_replace_item_raises_for_unknown_id(db_session):
    with pytest.raises(item_service.ItemNotFoundError):
        item_service.replace_item(db_session, 999, ItemCreate(name="Lápis"))


def test_update_item_changes_only_provided_fields(db_session):
    created = item_service.create_item(
        db_session, ItemCreate(name="Caneta", description="Azul")
    )

    updated = item_service.update_item(
        db_session, created.id, ItemUpdate(description="Vermelha")
    )

    assert updated.name == "Caneta"
    assert updated.description == "Vermelha"


def test_update_item_raises_for_unknown_id(db_session):
    with pytest.raises(item_service.ItemNotFoundError):
        item_service.update_item(db_session, 999, ItemUpdate(name="Lápis"))


def test_delete_item_removes_it(db_session):
    created = item_service.create_item(db_session, ItemCreate(name="Caneta"))

    item_service.delete_item(db_session, created.id)

    with pytest.raises(item_service.ItemNotFoundError):
        item_service.get_item(db_session, created.id)


def test_delete_item_raises_for_unknown_id(db_session):
    with pytest.raises(item_service.ItemNotFoundError):
        item_service.delete_item(db_session, 999)
