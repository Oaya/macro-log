import strawberry


@strawberry.input
class FoodInput:
    name: str
    serving_size: str | None = None
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float | None = None
    sodium_mg: float | None = None
