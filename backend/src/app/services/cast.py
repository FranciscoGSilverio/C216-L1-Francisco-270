from sqlalchemy.orm import Session

from app.models.movie_actor import MovieActor
from app.repositories.cast import CastRepository
from app.schemas.cast import CastCreate, CastMember, CastUpdate
from app.services import actor as actor_service
from app.services import movie as movie_service


class DuplicateCastError(Exception):
    def __init__(self, movie_id: int, actor_id: int) -> None:
        self.movie_id = movie_id
        self.actor_id = actor_id
        super().__init__("Este ator já está no elenco deste filme")


class CastNotFoundError(Exception):
    def __init__(self, movie_id: int, actor_id: int) -> None:
        self.movie_id = movie_id
        self.actor_id = actor_id
        super().__init__("Vínculo não encontrado")


def to_member(member: MovieActor) -> CastMember:
    return CastMember(
        actor_id=member.actor_id,
        actor_name=member.actor.name,
        character=member.character,
    )


def _get_link(db: Session, movie_id: int, actor_id: int) -> MovieActor:
    movie_service.get_movie(db, movie_id)
    member = CastRepository(db).get(movie_id, actor_id)
    if member is None:
        raise CastNotFoundError(movie_id, actor_id)

    return member


def add_member(db: Session, movie_id: int, data: CastCreate) -> CastMember:
    movie_service.get_movie(db, movie_id)
    actor_service.get_actor(db, data.actor_id)
    repository = CastRepository(db)
    if repository.get(movie_id, data.actor_id) is not None:
        raise DuplicateCastError(movie_id, data.actor_id)

    return to_member(repository.add(movie_id, data.actor_id, data.character))


def update_member(
    db: Session, movie_id: int, actor_id: int, data: CastUpdate
) -> CastMember:
    member = _get_link(db, movie_id, actor_id)
    return to_member(CastRepository(db).update_character(member, data.character))


def remove_member(db: Session, movie_id: int, actor_id: int) -> None:
    member = _get_link(db, movie_id, actor_id)
    CastRepository(db).delete(member)
