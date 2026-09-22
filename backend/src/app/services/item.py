from app.repositories.item import repository
from app.schemas.item import Item, ItemCreate, ItemUpdate


class ItemNotFoundError(Exception):
    def __init__(self, item_id: int) -> None:
        self.item_id = item_id
        super().__init__(f"Item {item_id} não encontrado")


def list_items(limit: int | None = None) -> list[Item]:
    items = repository.list()
    if limit is not None:
        return items[:limit]

    return items


def get_item(item_id: int) -> Item:
    item = repository.get(item_id)
    if item is None:
        raise ItemNotFoundError(item_id)

    return item


def create_item(data: ItemCreate) -> Item:
    return repository.add(data)


def replace_item(item_id: int, data: ItemCreate) -> Item:
    item = repository.replace(item_id, data)
    if item is None:
        raise ItemNotFoundError(item_id)

    return item


def update_item(item_id: int, data: ItemUpdate) -> Item:
    item = repository.update(item_id, data)
    if item is None:
        raise ItemNotFoundError(item_id)

    return item


def delete_item(item_id: int) -> None:
    if not repository.delete(item_id):
        raise ItemNotFoundError(item_id)
