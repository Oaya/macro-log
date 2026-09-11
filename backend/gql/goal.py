from datetime import date

import strawberry
from sqlalchemy import select
from strawberry.types import Info

from calculations import calculate_goal
from database import SessionLocal
from gql.context import require_user
from gql.converters import calculate_age
from gql.types import ActivityLevel, Goal
from models import BodyWeight as BodyWeightModel
from models import Goal as GoalModel
from models import User as UserModel


@strawberry.type
class GoalQuery:
    @strawberry.field
    def goal(self, info: Info) -> Goal:

        current_user = require_user(info)

        db = SessionLocal()

        try:
            goal = db.execute(
                select(GoalModel).where(GoalModel.user_id == current_user.id)
            ).scalar_one_or_none()

            if goal is None:
                raise Exception("Goal not found")

            return Goal(
                id=strawberry.ID(str(goal.id)),
                daily_calories=goal.daily_calories,
                protein_g=goal.protein_g,
                fat_g=goal.fat_g,
                carbs_g=goal.carbs_g,
                target_date=str(goal.target_date),
                target_weight_kg=goal.target_weight_kg,
                activity_level=ActivityLevel(goal.activity_level),
            )
        finally:
            db.close()


@strawberry.type
class GoalMutation:
    @strawberry.mutation
    def set_weight_goal(
        self,
        info: Info,
        target_weight_kg: float,
        target_date: date,
        activity_level: str,
    ) -> Goal:

        current_user = require_user(info)

        db = SessionLocal()

        try:
            # Gather required metrics
            db_user = db.get(UserModel, current_user.id)

            if db_user is None:
                raise Exception("User not found")

            latest_weight = (
                db.execute(
                    select(BodyWeightModel)
                    .where(BodyWeightModel.user_id == current_user.id)
                    .order_by(BodyWeightModel.recorded_date.desc())
                )
                .scalars()
                .first()
            )

            if not (
                db_user.height_cm
                and db_user.date_of_birth
                and db_user.sex
                and latest_weight
            ):
                raise Exception(
                    "Please complete your profile (height, date of birth, sex, and record a weight) first"
                )

            age = calculate_age(db_user.date_of_birth)
            days = (target_date - date.today()).days

            if days <= 0:
                raise Exception("Target date must be in the future")

            result = calculate_goal(
                weight_kg=latest_weight.weight_kg,
                height_cm=db_user.height_cm,
                age=age,
                sex=db_user.sex,
                activity_level=activity_level,
                current_weight=latest_weight.weight_kg,
                target_weight=target_weight_kg,
                days=days,
            )
            # Upsert the goal (same as before)
            goal = db.execute(
                select(GoalModel).where(GoalModel.user_id == current_user.id)
            ).scalar_one_or_none()
            if goal:
                goal.daily_calories = result["daily_calories"]
                goal.protein_g = result["protein_g"]
                goal.carbs_g = result["carbs_g"]
                goal.fat_g = result["fat_g"]
                goal.target_weight_kg = target_weight_kg
                goal.target_date = target_date
                goal.activity_level = activity_level
            else:
                goal = GoalModel(
                    user_id=current_user.id,
                    target_weight_kg=target_weight_kg,
                    target_date=target_date,
                    activity_level=activity_level,
                    **result,
                )
                db.add(goal)
            db.commit()
            db.refresh(goal)

            return Goal(
                id=strawberry.ID(str(goal.id)),
                daily_calories=goal.daily_calories,
                protein_g=goal.protein_g,
                carbs_g=goal.carbs_g,
                fat_g=goal.fat_g,
                target_date=str(goal.target_date),
                target_weight_kg=goal.target_weight_kg,
                activity_level=ActivityLevel(goal.activity_level),
            )
        finally:
            db.close()
