from datetime import date

from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Actor(Base):
    __tablename__ = "actors"
    __table_args__ = (UniqueConstraint("name", name="uq_actors_name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    birth_date: Mapped[date | None]
    nationality: Mapped[str | None] = mapped_column(String(80))
