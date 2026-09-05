import enum

import strawberry


@strawberry.enum
class MealType(enum.Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"
    SNACK = "SNACK"


@strawberry.type
class User:
    id: strawberry.ID
    email: str
    created_at: str


@strawberry.type
class AuthPayload:
    token: str
    user: User


@strawberry.type
class FoodSearchResult:
    name: str
    barcode: str | None
    serving_size: str | None
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float | None
    sodium_mg: float | None


@strawberry.type
class FoodLog:
    id: strawberry.ID
    quantity: float
    meal_type: MealType
    log_date: str
    food_name: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float | None
    sodium_mg: float | None
