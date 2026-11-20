from sqlalchemy.orm import Session

from app.models.actor import Actor
from app.repositories.actor import ActorRepository
from app.schemas.actor import ActorCreate


class ActorNotFoundError(Exception):
    def __init__(self, actor_id: int) -> None:
        self.actor_id = actor_id
        super().__init__("Ator não encontrado")


class DuplicateActorNameError(Exception):
    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__("Já existe um ator com esse nome")


def _ensure_name_available(
    repository: ActorRepository, name: str, actor_id: int | None = None
) -> None:
    existing = repository.get_by_name(name)
    if existing is not None and existing.id != actor_id:
        raise DuplicateActorNameError(name)


def list_actors(db: Session, name: str | None = None) -> list[Actor]:
    return ActorRepository(db).list(name=name)


def get_actor(db: Session, actor_id: int) -> Actor:
    actor = ActorRepository(db).get(actor_id)
    if actor is None:
        raise ActorNotFoundError(actor_id)

    return actor


def create_actor(db: Session, data: ActorCreate) -> Actor:
    repository = ActorRepository(db)
    _ensure_name_available(repository, data.name)
    return repository.add(data)


def replace_actor(db: Session, actor_id: int, data: ActorCreate) -> Actor:
    repository = ActorRepository(db)
    actor = repository.get(actor_id)
    if actor is None:
        raise ActorNotFoundError(actor_id)

    _ensure_name_available(repository, data.name, actor_id)
    return repository.replace(actor, data)


def delete_actor(db: Session, actor_id: int) -> None:
    repository = ActorRepository(db)
    actor = repository.get(actor_id)
    if actor is None:
        raise ActorNotFoundError(actor_id)

    repository.delete(actor)
