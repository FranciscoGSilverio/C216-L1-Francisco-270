import pytest

from app.schemas.item import ItemCreate, ItemUpdate
from app.services import item as item_service


def test_create_item_assigns_incremental_id():
    first = item_service.create_item(ItemCreate(name="Caneta"))
    second = item_service.create_item(ItemCreate(name="Caderno"))

    assert first.id == 1
    assert second.id == 2


def test_list_items_returns_created_items():
    item_service.create_item(ItemCreate(name="Caneta"))
    item_service.create_item(ItemCreate(name="Caderno"))

    items = item_service.list_items()

    assert [item.name for item in items] == ["Caneta", "Caderno"]


def test_list_items_respects_limit():
    item_service.create_item(ItemCreate(name="Caneta"))
    item_service.create_item(ItemCreate(name="Caderno"))

    items = item_service.list_items(limit=1)

    assert len(items) == 1


def test_get_item_returns_existing_item():
    created = item_service.create_item(ItemCreate(name="Caneta"))

    found = item_service.get_item(created.id)

    assert found == created


def test_get_item_raises_for_unknown_id():
    with pytest.raises(item_service.ItemNotFoundError):
        item_service.get_item(999)


def test_replace_item_overwrites_fields():
    created = item_service.create_item(ItemCreate(name="Caneta", description="Azul"))

    replaced = item_service.replace_item(created.id, ItemCreate(name="Lápis"))

    assert replaced.name == "Lápis"
    assert replaced.description is None


def test_replace_item_raises_for_unknown_id():
    with pytest.raises(item_service.ItemNotFoundError):
        item_service.replace_item(999, ItemCreate(name="Lápis"))


def test_update_item_changes_only_provided_fields():
    created = item_service.create_item(ItemCreate(name="Caneta", description="Azul"))

    updated = item_service.update_item(created.id, ItemUpdate(description="Vermelha"))

    assert updated.name == "Caneta"
    assert updated.description == "Vermelha"


def test_update_item_raises_for_unknown_id():
    with pytest.raises(item_service.ItemNotFoundError):
        item_service.update_item(999, ItemUpdate(name="Lápis"))


def test_delete_item_removes_it():
    created = item_service.create_item(ItemCreate(name="Caneta"))

    item_service.delete_item(created.id)

    with pytest.raises(item_service.ItemNotFoundError):
        item_service.get_item(created.id)


def test_delete_item_raises_for_unknown_id():
    with pytest.raises(item_service.ItemNotFoundError):
        item_service.delete_item(999)
