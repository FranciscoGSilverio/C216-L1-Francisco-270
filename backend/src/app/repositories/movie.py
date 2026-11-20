from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.movie import Movie
from app.repositories.actor import escape_like
from app.schemas.movie import MovieCreate


class MovieRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(
        self, title: str | None = None, actor_id: int | None = None
    ) -> list[Movie]:
        statement = select(Movie).order_by(Movie.title, Movie.year)
        if title:
            pattern = f"%{escape_like(title)}%"
            statement = statement.where(Movie.title.ilike(pattern, escape="\\"))

        return list(self.db.scalars(statement))

    def get(self, movie_id: int) -> Movie | None:
        return self.db.get(Movie, movie_id)

    def get_by_title_year(self, title: str, year: int) -> Movie | None:
        return self.db.scalar(
            select(Movie).where(Movie.title == title, Movie.year == year)
        )

    def add(self, data: MovieCreate) -> Movie:
        movie = Movie(**data.model_dump())
        self.db.add(movie)
        self.db.commit()
        self.db.refresh(movie)
        return movie

    def replace(self, movie: Movie, data: MovieCreate) -> Movie:
        for field, value in data.model_dump().items():
            setattr(movie, field, value)

        self.db.commit()
        self.db.refresh(movie)
        return movie

    def delete(self, movie: Movie) -> None:
        self.db.delete(movie)
        self.db.commit()
