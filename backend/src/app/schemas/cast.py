from typing import Annotated

from pydantic import BaseModel, StringConstraints

Character = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)
]


class CastCreate(BaseModel):
    actor_id: int
    character: Character


class CastUpdate(BaseModel):
    character: Character


class CastMember(BaseModel):
    actor_id: int
    actor_name: str
    character: str
