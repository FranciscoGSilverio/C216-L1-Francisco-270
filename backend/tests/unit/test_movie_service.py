import pytest

from app.schemas.movie import MovieCreate
from app.services import movie as movie_service


def make(title="Cidade de Deus", year=2002, **extra):
    return MovieCreate(title=title, year=year, **extra)


def test_create_movie_assigns_distinct_ids(db_session):
    first = movie_service.create_movie(db_session, make("A"))
    second = movie_service.create_movie(db_session, make("B"))

    assert first.id != second.id


def test_create_movie_rejects_same_title_and_year(db_session):
    movie_service.create_movie(db_session, make())

    with pytest.raises(movie_service.DuplicateMovieError):
        movie_service.create_movie(db_session, make())


def test_create_movie_allows_same_title_with_other_year(db_session):
    movie_service.create_movie(db_session, make("Rei Leão", 1994))

    movie = movie_service.create_movie(db_session, make("Rei Leão", 2019))

    assert movie.year == 2019


def test_get_movie_raises_when_missing(db_session):
    with pytest.raises(movie_service.MovieNotFoundError):
        movie_service.get_movie(db_session, 999)


def test_replace_movie_keeping_own_values_is_allowed(db_session):
    movie = movie_service.create_movie(db_session, make())

    updated = movie_service.replace_movie(db_session, movie.id, make(genre="Drama"))

    assert updated.genre == "Drama"


def test_replace_movie_with_taken_title_and_year_is_rejected(db_session):
    movie_service.create_movie(db_session, make("A", 2000))
    other = movie_service.create_movie(db_session, make("B", 2001))

    with pytest.raises(movie_service.DuplicateMovieError):
        movie_service.replace_movie(db_session, other.id, make("A", 2000))


def test_replace_missing_movie_with_taken_values_raises_not_found(db_session):
    movie_service.create_movie(db_session, make("A", 2000))

    with pytest.raises(movie_service.MovieNotFoundError):
        movie_service.replace_movie(db_session, 999, make("A", 2000))


def test_delete_movie_removes_it(db_session):
    movie = movie_service.create_movie(db_session, make())

    movie_service.delete_movie(db_session, movie.id)

    with pytest.raises(movie_service.MovieNotFoundError):
        movie_service.get_movie(db_session, movie.id)


def test_delete_missing_movie_raises(db_session):
    with pytest.raises(movie_service.MovieNotFoundError):
        movie_service.delete_movie(db_session, 999)


def test_list_movies_filters_by_partial_title_ignoring_case(db_session):
    movie_service.create_movie(db_session, make("Cidade de Deus"))
    movie_service.create_movie(db_session, make("Central do Brasil", 1998))

    titles = [m.title for m in movie_service.list_movies(db_session, title="CIDADE")]

    assert titles == ["Cidade de Deus"]


def test_list_movies_treats_percent_as_literal(db_session):
    movie_service.create_movie(db_session, make())

    assert movie_service.list_movies(db_session, title="%") == []


def test_list_movies_is_ordered_by_title_then_year(db_session):
    movie_service.create_movie(db_session, make("B", 2000))
    movie_service.create_movie(db_session, make("A", 2010))
    movie_service.create_movie(db_session, make("A", 1990))

    result = [(m.title, m.year) for m in movie_service.list_movies(db_session)]

    assert result == [("A", 1990), ("A", 2010), ("B", 2000)]
