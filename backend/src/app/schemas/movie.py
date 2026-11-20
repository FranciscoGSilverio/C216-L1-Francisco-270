from datetime import datetime, timezone
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints, field_validator

from app.schemas.cast import CastMember

MIN_YEAR = 1888
MAX_YEARS_AHEAD = 5

Title = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)
]


def _optional_text(value: str | None, max_length: int, label: str) -> str | None:
    if value is None:
        return None
    value = value.strip()
    if len(value) > max_length:
        raise ValueError(f"{label} deve ter no máximo {max_length} caracteres")
    return value or None


class MovieCreate(BaseModel):
    title: Title
    year: int
    genre: str | None = None
    synopsis: str | None = None

    @field_validator("year")
    @classmethod
    def year_in_range(cls, value: int) -> int:
        max_year = datetime.now(timezone.utc).year + MAX_YEARS_AHEAD
        if not MIN_YEAR <= value <= max_year:
            raise ValueError(f"O ano deve estar entre {MIN_YEAR} e {max_year}")
        return value

    @field_validator("genre")
    @classmethod
    def clean_genre(cls, value: str | None) -> str | None:
        return _optional_text(value, 60, "O gênero")

    @field_validator("synopsis")
    @classmethod
    def clean_synopsis(cls, value: str | None) -> str | None:
        return _optional_text(value, 2000, "A sinopse")


class MovieRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    year: int
    genre: str | None = None
    synopsis: str | None = None


class MovieDetail(MovieRead):
    cast: list[CastMember] = []
