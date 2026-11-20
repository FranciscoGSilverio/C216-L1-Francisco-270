from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.actor import Actor
from app.models.movie_actor import MovieActor


class CastRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_movie(self, movie_id: int) -> list[MovieActor]:
        statement = (
            select(MovieActor)
            .join(Actor, Actor.id == MovieActor.actor_id)
            .where(MovieActor.movie_id == movie_id)
            .order_by(Actor.name)
        )
        return list(self.db.scalars(statement))

    def get(self, movie_id: int, actor_id: int) -> MovieActor | None:
        return self.db.get(MovieActor, (movie_id, actor_id))

    def add(self, movie_id: int, actor_id: int, character: str) -> MovieActor:
        member = MovieActor(movie_id=movie_id, actor_id=actor_id, character=character)
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def update_character(self, member: MovieActor, character: str) -> MovieActor:
        member.character = character
        self.db.commit()
        self.db.refresh(member)
        return member

    def delete(self, member: MovieActor) -> None:
        self.db.delete(member)
        self.db.commit()
