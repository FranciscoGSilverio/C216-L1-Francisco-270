from datetime import date, datetime, timezone
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints, field_validator

Name = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)
]


class ActorCreate(BaseModel):
    name: Name
    birth_date: date | None = None
    nationality: str | None = None

    @field_validator("birth_date")
    @classmethod
    def birth_date_not_in_future(cls, value: date | None) -> date | None:
        if value is not None and value > datetime.now(timezone.utc).date():
            raise ValueError("A data de nascimento não pode ser futura")
        return value

    @field_validator("nationality")
    @classmethod
    def clean_nationality(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if len(value) > 80:
            raise ValueError("A nacionalidade deve ter no máximo 80 caracteres")
        return value or None


class ActorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    birth_date: date | None = None
    nationality: str | None = None
