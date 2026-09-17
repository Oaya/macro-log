import uuid
from datetime import date

import strawberry
from sqlalchemy import select
from strawberry.types import Info

from database import SessionLocal
from gql.context import require_user
from gql.inputs import FoodInput
from gql.types import FoodLog, FoodSearchResult, FoodSource, MealType
from models import Food as FoodModel
from models import FoodLog as FoodLogModel
from USDAFoodSearch import search_foods


@strawberry.type
class FoodQuery:
    @strawberry.field
    def search_foods(
        self, info: Info, query: str, limit: int = 15
    ) -> list[FoodSearchResult]:
        current_user = info.context[
            "current_user"
        ]  # optional — search works logged out too

        db = SessionLocal()
        try:
            my_foods = []
            if current_user is not None:
                db_foods = (
                    db.execute(
                        select(FoodModel)
                        .where(
                            FoodModel.name.ilike(f"%{query}%"),
                            FoodModel.created_by_user_id
                            == current_user.id,  # ONLY explicit My Foods
                        )
                        .order_by(FoodModel.created_at.desc())
                        .limit(limit)
                    )
                    .scalars()
                    .all()
                )
                my_foods = [
                    FoodSearchResult(
                        id=strawberry.ID(str(f.id)),
                        name=f.name,
                        brands=None,
                        calories=f.calories,
                        protein_g=f.protein_g,
                        carbs_g=f.carbs_g,
                        fat_g=f.fat_g,
                        fiber_g=f.fiber_g,
                        sodium_mg=f.sodium_mg,
                        serving_size=f.serving_size,
                        source=FoodSource.YOUR_FOODS,
                    )
                    for f in db_foods
                ]

            remaining = limit - len(my_foods)
            external = []
            if remaining > 0:
                raw = search_foods(query, remaining)
                external = [
                    FoodSearchResult(**r, source=FoodSource.DATABASE) for r in raw
                ]

            return my_foods + external
        finally:
            db.close()

    @strawberry.field
    def recent_foods(self, info: Info, limit: int = 100) -> list[FoodSearchResult]:
        current_user = require_user(info)
        db = SessionLocal()

        try:
            # distinct foods from your recent logs, most recent first
            recent_logs = (
                db.execute(
                    select(FoodLogModel)
                    .where(FoodLogModel.user_id == current_user.id)
                    .order_by(FoodLogModel.created_at.desc())
                    .limit(limit * 3)  # over-fetch to allow de-duping by name
                )
                .scalars()
                .all()
            )

            seen = set()
            results = []
            for log in recent_logs:
                if log.food.name in seen:
                    continue

                seen.add(log.food.name)

                results.append(
                    FoodSearchResult(
                        id=strawberry.ID(str(log.food.id)),
                        brands=None,
                        name=log.food.name,
                        calories=log.food.calories,
                        protein_g=log.food.protein_g,
                        fat_g=log.food.fat_g,
                        carbs_g=log.food.carbs_g,
                        fiber_g=log.food.fiber_g,
                        sodium_mg=log.food.sodium_mg,
                        serving_size=log.food.serving_size,
                        source=FoodSource.RECENT,
                    )
                )

                if len(results) >= limit:
                    break

            return results
        finally:
            db.close()

    @strawberry.field
    def my_foods(self, info: Info, limit: int = 100) -> list[FoodSearchResult]:
        current_user = require_user(info)
        db = SessionLocal()

        try:
            # distinct foods from your recent logs, most recent first
            my_foods = (
                db.execute(
                    select(FoodModel)
                    .where(FoodModel.created_by_user_id == current_user.id)
                    .order_by(FoodModel.created_at.desc())
                    .limit(limit)
                )
                .scalars()
                .all()
            )

            results = [
                FoodSearchResult(
                    id=strawberry.ID(str(f.id)),
                    name=f.name,
                    brands=None,
                    calories=f.calories,
                    protein_g=f.protein_g,
                    carbs_g=f.carbs_g,
                    fat_g=f.fat_g,
                    fiber_g=f.fiber_g,
                    sodium_mg=f.sodium_mg,
                    serving_size=f.serving_size,
                    source=FoodSource.YOUR_FOODS,
                )
                for f in my_foods
            ]
            return results
        finally:
            db.close()

    @strawberry.field
    def food_logs(self, info: Info, log_date: date | None = None) -> list[FoodLog]:
        current_user = require_user(info)

        db = SessionLocal()

        try:
            query = select(FoodLogModel).where(FoodLogModel.user_id == current_user.id)

            # Optional date filter
            if log_date is not None:
                query = query.where(FoodLogModel.log_date == log_date)

            db_logs = db.execute(query).scalars().all()

            return [
                FoodLog(
                    id=strawberry.ID(str(d.id)),
                    quantity=d.quantity,
                    meal_type=MealType(d.meal_type),
                    log_date=str(d.log_date),
                    food_name=d.food.name,
                    calories=d.food.calories,
                    protein_g=d.food.protein_g,
                    carbs_g=d.food.carbs_g,
                    fat_g=d.food.fat_g,
                    fiber_g=d.food.fiber_g,
                    sodium_mg=d.food.sodium_mg,
                )
                for d in db_logs
            ]
        finally:
            db.close()


@strawberry.type
class FoodMutation:
    @strawberry.mutation
    def log_food(
        self,
        info: Info,
        food: FoodInput,
        quantity: float,  # multiplier of 100g, not a serving count
        meal_type: MealType,
        log_date: date | None = None,
    ) -> FoodLog:
        # Only signed-in users can log food.
        current_user = require_user(info)

        db = SessionLocal()

        try:
            # snapshot the food into our foods table.
            db_food = FoodModel(
                name=food.name,
                serving_size=food.serving_size,
                calories=food.calories,
                protein_g=food.protein_g,
                carbs_g=food.carbs_g,
                fat_g=food.fat_g,
                fiber_g=food.fiber_g,
                sodium_mg=food.sodium_mg,
                created_by_user_id=None,
                is_public=True,
            )
            db.add(db_food)
            db.flush()

            # Create the food log linking user + food
            db_log = FoodLogModel(
                user_id=current_user.id,
                food_id=db_food.id,
                quantity=quantity,
                meal_type=meal_type.value,
                log_date=log_date,
            )

            db.add(db_log)
            db.commit()
            db.refresh(db_log)

            # Return the created log
            return FoodLog(
                id=strawberry.ID(str(db_log.id)),
                quantity=db_log.quantity,
                meal_type=meal_type,
                log_date=str(db_log.log_date),
                food_name=db_food.name,
                calories=db_food.calories,
                protein_g=db_food.protein_g,
                carbs_g=db_food.carbs_g,
                fat_g=db_food.fat_g,
                fiber_g=db_food.fiber_g,
                sodium_mg=db_food.sodium_mg,
            )
        finally:
            db.close()

    @strawberry.mutation
    def create_food(
        self,
        info: Info,
        name: str,
        serving_size: str,
        calories: float,
        protein_g: float,
        carbs_g: float,
        fat_g: float,
        fiber_g: float | None = None,
        sodium_mg: float | None = None,
    ) -> FoodSearchResult:
        current_user = require_user(info)

        db = SessionLocal()

        try:
            db_food = FoodModel(
                name=name,
                serving_size=serving_size,
                calories=calories,
                protein_g=protein_g,
                carbs_g=carbs_g,
                fat_g=fat_g,
                fiber_g=fiber_g,
                sodium_mg=sodium_mg,
                created_by_user_id=current_user.id,
                is_public=False,
            )

            db.add(db_food)
            db.commit()
            db.refresh(db_food)

            return FoodSearchResult(
                name=db_food.name,
                brands=None,
                id=str(db_food.id),
                serving_size=db_food.serving_size,
                calories=db_food.calories,
                protein_g=db_food.protein_g,
                carbs_g=db_food.carbs_g,
                fat_g=db_food.fat_g,
                fiber_g=db_food.fiber_g,
                sodium_mg=db_food.sodium_mg,
                source=FoodSource.YOUR_FOODS,
            )
        finally:
            db.close()

    @strawberry.mutation
    def delete_food_log(self, info: Info, id: strawberry.ID) -> bool:
        current_user = require_user(info)

        db = SessionLocal()

        try:
            log = db.get(FoodLogModel, uuid.UUID(str(id)))
            if log is None:
                raise Exception("Food log not found")
            if log.user_id != current_user.id:
                raise Exception("Not authorized to delete this log")

            db.delete(log)
            db.commit()
            return True
        finally:
            db.close()
