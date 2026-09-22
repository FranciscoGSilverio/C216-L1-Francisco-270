from app.schemas.item import Item, ItemCreate, ItemUpdate


class InMemoryItemRepository:
    def __init__(self) -> None:
        self._items: dict[int, Item] = {}
        self._next_id = 1

    def list(self) -> list[Item]:
        return list(self._items.values())

    def get(self, item_id: int) -> Item | None:
        return self._items.get(item_id)

    def add(self, data: ItemCreate) -> Item:
        item = Item(id=self._next_id, **data.model_dump())
        self._items[item.id] = item
        self._next_id += 1
        return item

    def replace(self, item_id: int, data: ItemCreate) -> Item | None:
        if item_id not in self._items:
            return None

        item = Item(id=item_id, **data.model_dump())
        self._items[item_id] = item
        return item

    def update(self, item_id: int, data: ItemUpdate) -> Item | None:
        current = self._items.get(item_id)
        if current is None:
            return None

        updated = current.model_copy(update=data.model_dump(exclude_unset=True))
        self._items[item_id] = updated
        return updated

    def delete(self, item_id: int) -> bool:
        return self._items.pop(item_id, None) is not None

    def reset(self) -> None:
        self._items.clear()
        self._next_id = 1


repository = InMemoryItemRepository()
