from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def home():
    return {"message": "API do Cinema"}


@router.get("/status")
def status():
    return {"status": "online"}
