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
class ActivityLevel(enum.Enum):
    SEDENTARY = "SEDENTARY"
    LIGHT = "LIGHT"
    MODERATE = "MODERATE"
    ACTIVE = "ACTIVE"


@strawberry.enum
class UnitPreference(enum.Enum):
    METRIC = "METRIC"
    IMPERIAL = "IMPERIAL"


@strawberry.enum
class ExerciseType(enum.Enum):
    CARDIO = "CARDIO"
    STRENGTH = "STRENGTH"
    FLEXIBILITY = "FLEXIBILITY"


@strawberry.enum
class CaloriesEstimateStatus(enum.Enum):
    # Calories burned were estimated successfully.
    CALCULATED = "CALCULATED"
    # No duration was provided, so there is nothing to estimate from.
    NO_DURATION = "NO_DURATION"
    # The exercise has no MET value on file.
    NO_MET_VALUE = "NO_MET_VALUE"
    # The user has never recorded a body weight.
    NO_BODY_WEIGHT = "NO_BODY_WEIGHT"


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
class BodyWeight:
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


@strawberry.type
class Exercise:
    id: strawberry.ID
    name: str
    type: ExerciseType
    met_value: float | None


@strawberry.type
class WorkoutLog:
    id: strawberry.ID
    exercise_name: str
    sets: int | None
    reps: int | None
    weight: float | None
    duration_min: int | None
    calories_burned: float | None
    calories_estimate_status: CaloriesEstimateStatus
    log_date: str


@strawberry.type
class Goal:
    id: strawberry.ID
    daily_calories: float
    protein_g: float
    fat_g: float
    carbs_g: float
    target_weight_kg: float | None
    target_date: str | None
    activity_level: ActivityLevel


@strawberry.type
class DailySummary:
    date: str
    calories_consumed: float
    calories_burned: float
    net_calories: float
    protein_g: float
    carbs_g: float
    fat_g: float

    # Goal comparison (null if no goal set)
    goal_calories: int | None
    calories_remaining: float | None
    goal_protein_g: int | None
    goal_carbs_g: int | None
    goal_fat_g: int | None
