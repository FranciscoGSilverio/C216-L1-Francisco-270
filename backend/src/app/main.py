from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def home():
    return {"message": "Olá, Sistemas Distribuídos!"}


@app.get("/status")
def status():
    return {"status": "online"}
