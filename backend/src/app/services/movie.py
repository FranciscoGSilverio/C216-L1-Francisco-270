from sqlalchemy.orm import Session

from app.models.movie import Movie
from app.repositories.cast import CastRepository
from app.repositories.movie import MovieRepository
from app.schemas.cast import CastMember
from app.schemas.movie import MovieCreate, MovieDetail, MovieRead


class MovieNotFoundError(Exception):
    def __init__(self, movie_id: int) -> None:
        self.movie_id = movie_id
        super().__init__("Filme não encontrado")


class DuplicateMovieError(Exception):
    def __init__(self, title: str, year: int) -> None:
        self.title = title
        self.year = year
        super().__init__("Já existe um filme com esse título e ano")


def _ensure_title_year_available(
    repository: MovieRepository, title: str, year: int, movie_id: int | None = None
) -> None:
    existing = repository.get_by_title_year(title, year)
    if existing is not None and existing.id != movie_id:
        raise DuplicateMovieError(title, year)


def list_movies(
    db: Session, title: str | None = None, actor_id: int | None = None
) -> list[Movie]:
    return MovieRepository(db).list(title=title, actor_id=actor_id)


def get_movie(db: Session, movie_id: int) -> Movie:
    movie = MovieRepository(db).get(movie_id)
    if movie is None:
        raise MovieNotFoundError(movie_id)

    return movie


def get_movie_detail(db: Session, movie_id: int) -> MovieDetail:
    movie = get_movie(db, movie_id)
    cast = [
        CastMember(
            actor_id=member.actor_id,
            actor_name=member.actor.name,
            character=member.character,
        )
        for member in CastRepository(db).list_by_movie(movie_id)
    ]
    return MovieDetail(**MovieRead.model_validate(movie).model_dump(), cast=cast)


def create_movie(db: Session, data: MovieCreate) -> Movie:
    repository = MovieRepository(db)
    _ensure_title_year_available(repository, data.title, data.year)
    return repository.add(data)


def replace_movie(db: Session, movie_id: int, data: MovieCreate) -> Movie:
    repository = MovieRepository(db)
    movie = repository.get(movie_id)
    if movie is None:
        raise MovieNotFoundError(movie_id)

    _ensure_title_year_available(repository, data.title, data.year, movie_id)
    return repository.replace(movie, data)


def delete_movie(db: Session, movie_id: int) -> None:
    repository = MovieRepository(db)
    movie = repository.get(movie_id)
    if movie is None:
        raise MovieNotFoundError(movie_id)

    repository.delete(movie)
