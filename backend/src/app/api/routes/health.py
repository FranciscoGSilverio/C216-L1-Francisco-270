from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def home():
    return {"message": "Olá, Sistemas Distribuídos!"}


@router.get("/status")
def status():
    return {"status": "online"}
