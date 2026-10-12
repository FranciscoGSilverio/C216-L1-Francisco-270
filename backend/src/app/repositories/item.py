from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


class ItemRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self, limit: int | None = None) -> list[Item]:
        statement = select(Item)
        if limit is not None:
            statement = statement.limit(limit)

        return list(self.db.scalars(statement))

    def get(self, item_id: int) -> Item | None:
        return self.db.get(Item, item_id)

    def add(self, data: ItemCreate) -> Item:
        item = Item(**data.model_dump())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def replace(self, item_id: int, data: ItemCreate) -> Item | None:
        item = self.get(item_id)
        if item is None:
            return None

        item.name = data.name
        item.description = data.description
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item_id: int, data: ItemUpdate) -> Item | None:
        item = self.get(item_id)
        if item is None:
            return None

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(item, field, value)

        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item_id: int) -> bool:
        item = self.get(item_id)
        if item is None:
            return False

        self.db.delete(item)
        self.db.commit()
        return True
