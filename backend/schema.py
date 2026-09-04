import strawberry
from sqlalchemy import select
from strawberry.types import Info

from database import SessionLocal
from models import User as UserModel
from security import create_access_token, hash_password, verify_password


#  GraphQL TYPES (what the API exposes)
@strawberry.type
class User:
    id: strawberry.ID
    email: str
    created_at: str


@strawberry.type
class AuthPayload:
    token: str
    user: User


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


schema = strawberry.Schema(query=Query, mutation=Mutation)
