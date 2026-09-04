import uuid

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# Every table gets a uuid id and created_at
class BaseMixin:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(BaseMixin, Base):
    __tablename__ = "users"

    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)

    # Relationships (a user has many of these)
    goal = relationship("Goal", back_populates="user", uselist=False)
    food_logs = relationship("FoodLog", back_populates="user")
    workout_logs = relationship("WorkoutLog", back_populates="user")


#  Goal: a user's daily calory/macro targets (one per user)
class Goal(BaseMixin, Base):
    __tablename__ = "goals"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    daily_calories = Column(Integer, nullable=False)
    protein_g = Column(Integer, nullable=False)
    carbs_g = Column(Integer, nullable=False)
    fat_g = Column(Integer, nullable=False)

    user = relationship("User", back_populates="goal")


#  Food: a food item with nutrition (per serving)
class Food(BaseMixin, Base):
    __tablename__ = "foods"

    name = Column(String, nullable=False, index=True)
    serving_size = Column(String)
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)

    food_logs = relationship("FoodLog", back_populates="food")


#  FoodLog: a logged meal (joins User and Food)


class FoodLog(BaseMixin, Base):
    __tablename__ = "food_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    food_id = Column(UUID(as_uuid=True), ForeignKey("foods.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    meal_type = Column(
        Enum("BREAKFAST", "LUNCH", "DINNER", "SNACK", name="meal_type"), nullable=False
    )
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="food_logs")
    food = relationship("Food", back_populates="food_logs")


class Exercise(BaseMixin, Base):
    __tablename__ = "exercises"

    name = Column(String, nullable=False, index=True)
    type = Column(
        Enum("CARDIO", "STRENGTH", "FLEXIBILITY", name="exercise_type"),
        nullable=False,
    )
    calories_per_minute = Column(Float)

    workout_logs = relationship("WorkoutLog", back_populates="exercise")


#  WorkoutLog: a logged workout (joins User and Exercise)
class WorkoutLog(BaseMixin, Base):
    __tablename__ = "workout_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False)
    sets = Column(Integer)
    reps = Column(Integer)
    weight = Column(Float)
    weight_type = Column(Enum("KG", "LB", name="weight_type"))
    duration_min = Column(Integer)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="workout_logs")
    exercise = relationship("Exercise", back_populates="workout_logs")
