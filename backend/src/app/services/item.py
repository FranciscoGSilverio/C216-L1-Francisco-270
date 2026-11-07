from sqlalchemy.orm import Session

from app.models.item import Item
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate


class ItemNotFoundError(Exception):
    def __init__(self, item_id: int) -> None:
        self.item_id = item_id
        super().__init__(f"Item {item_id} não encontrado")


class DuplicateItemNameError(Exception):
    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__("Já existe um item com esse nome")


def _ensure_name_available(
    repository: ItemRepository, name: str, item_id: int | None = None
) -> None:
    existing = repository.get_by_name(name)
    if existing is not None and existing.id != item_id:
        raise DuplicateItemNameError(name)


def list_items(db: Session, limit: int | None = None) -> list[Item]:
    return ItemRepository(db).list(limit=limit)


def get_item(db: Session, item_id: int) -> Item:
    item = ItemRepository(db).get(item_id)
    if item is None:
        raise ItemNotFoundError(item_id)

    return item


def create_item(db: Session, data: ItemCreate) -> Item:
    repository = ItemRepository(db)
    _ensure_name_available(repository, data.name)
    return repository.add(data)


def replace_item(db: Session, item_id: int, data: ItemCreate) -> Item:
    repository = ItemRepository(db)
    _ensure_name_available(repository, data.name, item_id)
    item = repository.replace(item_id, data)
    if item is None:
        raise ItemNotFoundError(item_id)

    return item


def update_item(db: Session, item_id: int, data: ItemUpdate) -> Item:
    repository = ItemRepository(db)
    if data.name is not None:
        _ensure_name_available(repository, data.name, item_id)
    item = repository.update(item_id, data)
    if item is None:
        raise ItemNotFoundError(item_id)

    return item


def delete_item(db: Session, item_id: int) -> None:
    if not ItemRepository(db).delete(item_id):
        raise ItemNotFoundError(item_id)
