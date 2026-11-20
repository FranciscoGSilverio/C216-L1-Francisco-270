from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Movie(Base):
    __tablename__ = "movies"
    __table_args__ = (UniqueConstraint("title", "year", name="uq_movies_title_year"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    year: Mapped[int]
    genre: Mapped[str | None] = mapped_column(String(60))
    synopsis: Mapped[str | None] = mapped_column(String(2000))
