import os

DEFAULT_CORS_ORIGINS = "http://localhost:5173"


def parse_cors_origins(value: str) -> list[str]:
    origins = [origin.strip() for origin in value.split(",") if origin.strip()]
    if "*" in origins:
        raise ValueError("CORS_ORIGINS não pode conter '*'; informe origens explícitas")

    return origins


DATABASE_URL = os.environ["DATABASE_URL"]
CORS_ORIGINS = parse_cors_origins(os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS))
