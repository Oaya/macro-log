import enum

import strawberry


@strawberry.enum
class MealType(enum.Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"
    SNACK = "SNACK"


@strawberry.enum
class Sex(enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"


@strawberry.enum
class UnitPreference(enum.Enum):
    METRIC = "METRIC"
    IMPERIAL = "IMPERIAL"


@strawberry.type
class User:
    id: strawberry.ID
    email: str
    height_cm: float | None = None
    date_of_birth: str | None = None
    unit_preference: UnitPreference
    sex: Sex | None = None
    age: int | None = None
    created_at: str


@strawberry.type
class AuthPayload:
    token: str
    user: User


@strawberry.type
class BodyWeightType:
    id: strawberry.ID
    weight_kg: float
    recorded_date: str | None


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
