from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.movie import MovieCreate, MovieDetail, MovieRead
from app.services import movie as movie_service

router = APIRouter(prefix="/movies", tags=["Filmes"])


@router.get("", response_model=list[MovieRead])
def list_movies(
    title: str | None = None,
    actor_id: int | None = None,
    db: Session = Depends(get_db),
):
    return movie_service.list_movies(db, title=title, actor_id=actor_id)


@router.get("/{movie_id}", response_model=MovieDetail)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    try:
        return movie_service.get_movie_detail(db, movie_id)
    except movie_service.MovieNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=MovieRead, status_code=status.HTTP_201_CREATED)
def create_movie(data: MovieCreate, db: Session = Depends(get_db)):
    try:
        return movie_service.create_movie(db, data)
    except movie_service.DuplicateMovieError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/{movie_id}", response_model=MovieRead)
def replace_movie(movie_id: int, data: MovieCreate, db: Session = Depends(get_db)):
    try:
        return movie_service.replace_movie(db, movie_id, data)
    except movie_service.MovieNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except movie_service.DuplicateMovieError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(movie_id: int, db: Session = Depends(get_db)) -> None:
    try:
        movie_service.delete_movie(db, movie_id)
    except movie_service.MovieNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
