from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.cast import CastCreate, CastMember, CastUpdate
from app.services import actor as actor_service
from app.services import cast as cast_service
from app.services import movie as movie_service

router = APIRouter(prefix="/movies/{movie_id}/cast", tags=["Elenco"])

NOT_FOUND = (
    movie_service.MovieNotFoundError,
    actor_service.ActorNotFoundError,
    cast_service.CastNotFoundError,
)


@router.post("", response_model=CastMember, status_code=status.HTTP_201_CREATED)
def add_member(movie_id: int, data: CastCreate, db: Session = Depends(get_db)):
    try:
        return cast_service.add_member(db, movie_id, data)
    except NOT_FOUND as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except cast_service.DuplicateCastError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/{actor_id}", response_model=CastMember)
def update_member(
    movie_id: int, actor_id: int, data: CastUpdate, db: Session = Depends(get_db)
):
    try:
        return cast_service.update_member(db, movie_id, actor_id, data)
    except NOT_FOUND as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{actor_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(movie_id: int, actor_id: int, db: Session = Depends(get_db)) -> None:
    try:
        cast_service.remove_member(db, movie_id, actor_id)
    except NOT_FOUND as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
