from datetime import date

import strawberry
from sqlalchemy import select
from strawberry.types import Info

from database import SessionLocal
from gql.context import require_user
from gql.types import DailySummary
from models import (
    FoodLog as FoodLogModel,
)
from models import (
    Goal as GoalModel,
)
from models import (
    WorkoutLog as WorkoutLogModel,
)


@strawberry.type
class SummaryQuery:
    @strawberry.field
    def daily_summary(self, info: Info, summary_date: date) -> DailySummary:
        current_user = require_user(info)

        db = SessionLocal()

        try:
            # Food logs for the date -> sum calories and macros
            food_logs = (
                db.execute(
                    select(FoodLogModel).where(
                        FoodLogModel.user_id == current_user.id,
                        FoodLogModel.log_date == summary_date,
                    )
                )
                .scalars()
                .all()
            )

            calories_consumed = protein = carbs = fat = 0.0
            for log in food_logs:
                calories_consumed += log.food.calories * log.quantity
                protein += log.food.protein_g * log.quantity
                carbs += log.food.carbs_g * log.quantity
                fat += log.food.fat_g * log.quantity

            # workout logs for the date -> sum calories burned
            workout_logs = (
                db.execute(
                    select(WorkoutLogModel).where(
                        WorkoutLogModel.user_id == current_user.id,
                        WorkoutLogModel.log_date == summary_date,
                    )
                )
                .scalars()
                .all()
            )

            calories_burned = sum(
                w.calories_burned for w in workout_logs if w.calories_burned
            )

            # The user's goal
            goal = db.execute(
                select(GoalModel).where(GoalModel.user_id == current_user.id)
            ).scalar_one_or_none()

            net = calories_consumed - calories_burned
            goal_cal = goal.daily_calories if goal else None
            remaining = (goal_cal - net) if goal_cal is not None else None

            return DailySummary(
                date=str(summary_date),
                calories_consumed=round(calories_consumed, 1),
                calories_burned=round(calories_burned, 1),
                net_calories=round(net, 1),
                protein_g=round(protein, 1),
                carbs_g=round(carbs, 1),
                fat_g=round(fat, 1),
                goal_calories=goal_cal,
                calories_remaining=round(remaining, 1)
                if remaining is not None
                else None,
                goal_protein_g=goal.protein_g if goal else None,
                goal_carbs_g=goal.carbs_g if goal else None,
                goal_fat_g=goal.fat_g if goal else None,
            )

        finally:
            db.close()
