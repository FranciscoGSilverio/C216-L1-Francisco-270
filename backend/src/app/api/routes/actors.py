from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.actor import ActorCreate, ActorRead
from app.services import actor as actor_service

router = APIRouter(prefix="/actors", tags=["Atores"])


@router.get("", response_model=list[ActorRead])
def list_actors(name: str | None = None, db: Session = Depends(get_db)):
    return actor_service.list_actors(db, name=name)


@router.get("/{actor_id}", response_model=ActorRead)
def get_actor(actor_id: int, db: Session = Depends(get_db)):
    try:
        return actor_service.get_actor(db, actor_id)
    except actor_service.ActorNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=ActorRead, status_code=status.HTTP_201_CREATED)
def create_actor(data: ActorCreate, db: Session = Depends(get_db)):
    try:
        return actor_service.create_actor(db, data)
    except actor_service.DuplicateActorNameError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/{actor_id}", response_model=ActorRead)
def replace_actor(actor_id: int, data: ActorCreate, db: Session = Depends(get_db)):
    try:
        return actor_service.replace_actor(db, actor_id, data)
    except actor_service.ActorNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except actor_service.DuplicateActorNameError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{actor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_actor(actor_id: int, db: Session = Depends(get_db)) -> None:
    try:
        actor_service.delete_actor(db, actor_id)
    except actor_service.ActorNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
