from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.actor import Actor
from app.schemas.actor import ActorCreate


def escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


class ActorRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self, name: str | None = None) -> list[Actor]:
        statement = select(Actor).order_by(Actor.name)
        if name:
            pattern = f"%{escape_like(name)}%"
            statement = statement.where(Actor.name.ilike(pattern, escape="\\"))

        return list(self.db.scalars(statement))

    def get(self, actor_id: int) -> Actor | None:
        return self.db.get(Actor, actor_id)

    def get_by_name(self, name: str) -> Actor | None:
        return self.db.scalar(select(Actor).where(Actor.name == name))

    def add(self, data: ActorCreate) -> Actor:
        actor = Actor(**data.model_dump())
        self.db.add(actor)
        self.db.commit()
        self.db.refresh(actor)
        return actor

    def replace(self, actor: Actor, data: ActorCreate) -> Actor:
        for field, value in data.model_dump().items():
            setattr(actor, field, value)

        self.db.commit()
        self.db.refresh(actor)
        return actor

    def delete(self, actor: Actor) -> None:
        self.db.delete(actor)
        self.db.commit()
