import uuid
from datetime import date

import strawberry
from sqlalchemy import select
from strawberry.types import Info

from database import SessionLocal
from gql.context import require_user
from gql.types import CaloriesEstimateStatus, Exercise, ExerciseType, WorkoutLog
from models import BodyWeight as BodyWeightModel
from models import Exercise as ExerciseModel
from models import WorkoutLog as WorkoutLogModel


def _calories_estimate_status(
    calories_burned: float | None,
    duration_min: int | None,
    met_value: float | None,
) -> CaloriesEstimateStatus:
    """Explain why a calorie estimate is (or isn't) available.

    If ``calories_burned`` is set the estimate succeeded; otherwise report the
    first missing input the estimate needs, so the frontend can show an
    actionable hint (e.g. "record your body weight").
    """
    if calories_burned is not None:
        return CaloriesEstimateStatus.CALCULATED
    if not duration_min:
        return CaloriesEstimateStatus.NO_DURATION
    if not met_value:
        return CaloriesEstimateStatus.NO_MET_VALUE
    return CaloriesEstimateStatus.NO_BODY_WEIGHT


@strawberry.type
class WorkoutQuery:
    @strawberry.field
    def exercises(self) -> list[Exercise]:

        db = SessionLocal()
        try:
            db_exercises = db.execute(select(ExerciseModel)).scalars().all()

            return [
                Exercise(
                    id=strawberry.ID(str(e.id)),
                    name=e.name,
                    type=ExerciseType(e.type),
                    met_value=e.met_value,
                )
                for e in db_exercises
            ]
        finally:
            db.close()

    @strawberry.field
    def workout_logs(
        self, info: Info, log_date: date | None = None
    ) -> list[WorkoutLog]:
        current_user = require_user(info)

        db = SessionLocal()

        try:
            query = select(WorkoutLogModel).where(
                WorkoutLogModel.user_id == current_user.id
            )

            if log_date is not None:
                query = query.where(WorkoutLogModel.log_date == log_date)
            db_logs = db.execute(query).scalars().all()

            return [
                WorkoutLog(
                    id=strawberry.ID(str(w.id)),
                    exercise_name=w.exercise.name,
                    sets=w.sets,
                    reps=w.reps,
                    weight=w.weight,
                    duration_min=w.duration_min,
                    calories_burned=w.calories_burned,
                    calories_estimate_status=_calories_estimate_status(
                        w.calories_burned, w.duration_min, w.exercise.met_value
                    ),
                    log_date=str(w.log_date),
                )
                for w in db_logs
            ]
        finally:
            db.close()


@strawberry.type
class WorkoutMutation:
    @strawberry.mutation
    def log_workout(
        self,
        info: Info,
        exercise_id: strawberry.ID,
        sets: int | None = None,
        reps: int | None = None,
        weight: float | None = None,
        weight_type: str | None = None,
        duration_min: int | None = None,
        log_date: date | None = None,
    ) -> WorkoutLog:

        current_user = require_user(info)

        db = SessionLocal()

        try:
            exercise = db.get(ExerciseModel, uuid.UUID(str(exercise_id)))

            if exercise is None:
                raise Exception("Exercise not found")

            calories_burned = None
            if duration_min and exercise.met_value:
                latest_weight = (
                    db.execute(
                        select(BodyWeightModel)
                        .where(BodyWeightModel.user_id == current_user.id)
                        .order_by(BodyWeightModel.recorded_date.desc())
                    )
                    .scalars()
                    .first()
                )
                if latest_weight:
                    calories_burned = round(
                        exercise.met_value
                        * latest_weight.weight_kg
                        * (duration_min / 60),
                        1,
                    )

            db_workout = WorkoutLogModel(
                user_id=current_user.id,
                exercise_id=exercise.id,
                sets=sets,
                reps=reps,
                weight=weight,
                weight_type=weight_type,
                duration_min=duration_min,
                calories_burned=calories_burned,
                log_date=log_date or date.today(),
            )

            db.add(db_workout)
            db.commit()
            db.refresh(db_workout)

            return WorkoutLog(
                id=strawberry.ID(str(db_workout.id)),
                exercise_name=exercise.name,
                sets=db_workout.sets,
                reps=db_workout.reps,
                weight=db_workout.weight,
                duration_min=db_workout.duration_min,
                calories_burned=db_workout.calories_burned,
                calories_estimate_status=_calories_estimate_status(
                    db_workout.calories_burned,
                    db_workout.duration_min,
                    exercise.met_value,
                ),
                log_date=str(db_workout.log_date),
            )

        finally:
            db.close()
