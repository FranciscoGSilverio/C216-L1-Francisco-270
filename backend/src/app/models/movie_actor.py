from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.actor import Actor


class MovieActor(Base):
    __tablename__ = "movie_actors"

    movie_id: Mapped[int] = mapped_column(
        ForeignKey("movies.id", ondelete="CASCADE"), primary_key=True
    )
    actor_id: Mapped[int] = mapped_column(
        ForeignKey("actors.id", ondelete="CASCADE"), primary_key=True
    )
    character: Mapped[str] = mapped_column(String(150))

    actor: Mapped[Actor] = relationship(lazy="joined")
