from sqlalchemy.orm import Session

from app.models.item import Item
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate


class ItemNotFoundError(Exception):
    def __init__(self, item_id: int) -> None:
        self.item_id = item_id
        super().__init__(f"Item {item_id} não encontrado")


def list_items(db: Session, limit: int | None = None) -> list[Item]:
    return ItemRepository(db).list(limit=limit)


def get_item(db: Session, item_id: int) -> Item:
    item = ItemRepository(db).get(item_id)
    if item is None:
        raise ItemNotFoundError(item_id)

    return item


def create_item(db: Session, data: ItemCreate) -> Item:
    return ItemRepository(db).add(data)


def replace_item(db: Session, item_id: int, data: ItemCreate) -> Item:
    item = ItemRepository(db).replace(item_id, data)
    if item is None:
        raise ItemNotFoundError(item_id)

    return item


def update_item(db: Session, item_id: int, data: ItemUpdate) -> Item:
    item = ItemRepository(db).update(item_id, data)
    if item is None:
        raise ItemNotFoundError(item_id)

    return item


def delete_item(db: Session, item_id: int) -> None:
    if not ItemRepository(db).delete(item_id):
        raise ItemNotFoundError(item_id)
