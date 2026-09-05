import enum
from datetime import date

import strawberry
from sqlalchemy import select
from strawberry.types import Info

from database import SessionLocal
from models import Food as FoodModel
from models import FoodLog as FoodLogModel
from models import User as UserModel
from openfoodfacts import search_foods
from security import create_access_token, hash_password, verify_password

#  GraphQL TYPES (what the API exposes)

# ... other imports ...


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


#  Helper: convert a SQLAlchemy User -> a GraphQL User
#  (drops password_hash, formats fields for the API)
def to_graphql_user(db_user: UserModel) -> User:
    return User(
        id=strawberry.ID(str(db_user.id)),
        email=db_user.email,
        created_at=str(db_user.created_at),
    )


#  QUERY
@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "world"

    @strawberry.field
    def me(self, info: Info) -> User:

        current_user = info.context["current_user"]

        if current_user is None:
            raise Exception("Not authenticated")

        # Convert the SQLalchemy user to the GraphQL user
        return to_graphql_user(current_user)

    @strawberry.field
    def search_foods(self, query: str, limit: int = 30) -> list[FoodSearchResult]:
        raw_results = search_foods(query, limit)

        return [
            FoodSearchResult(
                name=r["name"],
                barcode=r["barcode"],
                serving_size=r["serving_size"],
                calories=r["calories"],
                protein_g=r["protein_g"],
                carbs_g=r["carbs_g"],
                fat_g=r["fat_g"],
                fiber_g=r["fiber_g"],
                sodium_mg=r["sodium_mg"],
            )
            for r in raw_results
        ]


#  MUTATION
@strawberry.type
class Mutation:
    @strawberry.mutation
    def register(self, email: str, password: str) -> AuthPayload:
        # Open DB for session
        db = SessionLocal()

        try:
            # check the email isn't already taken
            existing = db.execute(
                select(UserModel).where(UserModel.email == email)
            ).scalar_one_or_none()
            if existing:
                raise Exception("Email already registered")

            # Hash the password
            hashed = hash_password(password)

            # Create and save the new user
            db_user = UserModel(email=email, password_hash=hashed)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)

            # Create a JWT for the new user.
            token = create_access_token(str(db_user.id))

            # Return the token for safe graphQL user.
            return AuthPayload(token=token, user=to_graphql_user(db_user))
        finally:
            db.close()

    @strawberry.mutation
    def login(self, email: str, password: str) -> AuthPayload:
        db = SessionLocal()

        try:
            user = db.execute(
                select(UserModel).where(UserModel.email == email)
            ).scalar_one_or_none()

            if not user:
                raise Exception("Invalid email or password")

            is_password_verify = verify_password(password, user.password_hash)

            if not is_password_verify:
                raise Exception("Invalid email or password")

            # Create a JWT for the new user.
            token = create_access_token(str(user.id))

            return AuthPayload(token=token, user=to_graphql_user(user))

        finally:
            db.close()

    @strawberry.mutation
    def log_food(
        self,
        info: Info,
        food: FoodInput,
        quantity: float,
        meal_type: MealType,
        log_date: date | None = None,
    ) -> FoodLog:
        # Only signed-in users can log food.
        current_user = info.context["current_user"]
        if current_user is None:
            raise Exception("Not authenticated")

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
                created_by_user_id=current_user.id,
                is_public=False,
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


schema = strawberry.Schema(query=Query, mutation=Mutation)
