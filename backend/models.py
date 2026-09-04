import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from database import Base


# Every table gets a uuid id and created_at
class BaseMixin:
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class User(BaseMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    # Relationships (a user has many of these)
    goal: Mapped["Goal | None"] = relationship(back_populates="user", uselist=False)
    food_logs: Mapped[list["FoodLog"]] = relationship(back_populates="user")
    workout_logs: Mapped[list["WorkoutLog"]] = relationship(back_populates="user")


#  Goal: a user's daily calory/macro targets (one per user)
class Goal(BaseMixin, Base):
    __tablename__ = "goals"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    daily_calories: Mapped[int] = mapped_column(Integer, nullable=False)
    protein_g: Mapped[int] = mapped_column(Integer, nullable=False)
    carbs_g: Mapped[int] = mapped_column(Integer, nullable=False)
    fat_g: Mapped[int] = mapped_column(Integer, nullable=False)

    user: Mapped["User"] = relationship(back_populates="goal")


#  Food: a food item with nutrition (per serving)
class Food(BaseMixin, Base):
    __tablename__ = "foods"

    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    serving_size: Mapped[str | None] = mapped_column(String)
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    protein_g: Mapped[float] = mapped_column(Float, nullable=False)
    carbs_g: Mapped[float] = mapped_column(Float, nullable=False)
    fat_g: Mapped[float] = mapped_column(Float, nullable=False)

    food_logs: Mapped[list["FoodLog"]] = relationship(back_populates="food")


#  FoodLog: a logged meal (joins User and Food)


class FoodLog(BaseMixin, Base):
    __tablename__ = "food_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    food_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("foods.id"), nullable=False
    )
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    meal_type: Mapped[str] = mapped_column(
        Enum("BREAKFAST", "LUNCH", "DINNER", "SNACK", name="meal_type"), nullable=False
    )
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="food_logs")
    food: Mapped["Food"] = relationship(back_populates="food_logs")


class Exercise(BaseMixin, Base):
    __tablename__ = "exercises"

    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    type: Mapped[str] = mapped_column(
        Enum("CARDIO", "STRENGTH", "FLEXIBILITY", name="exercise_type"),
        nullable=False,
    )
    calories_per_minute: Mapped[float | None] = mapped_column(Float)

    workout_logs: Mapped[list["WorkoutLog"]] = relationship(back_populates="exercise")


#  WorkoutLog: a logged workout (joins User and Exercise)
class WorkoutLog(BaseMixin, Base):
    __tablename__ = "workout_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False
    )
    sets: Mapped[int | None] = mapped_column(Integer)
    reps: Mapped[int | None] = mapped_column(Integer)
    weight: Mapped[float | None] = mapped_column(Float)
    weight_type: Mapped[str | None] = mapped_column(
        Enum("KG", "LB", name="weight_type")
    )
    duration_min: Mapped[int | None] = mapped_column(Integer)
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="workout_logs")
    exercise: Mapped["Exercise"] = relationship(back_populates="workout_logs")
