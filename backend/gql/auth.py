import strawberry
from sqlalchemy import select
from strawberry.types import Info

from database import SessionLocal
from gql.converters import to_graphql_user
from gql.types import AuthPayload, User
from models import User as UserModel
from security import create_access_token, hash_password, verify_password


@strawberry.type
class AuthQuery:
    @strawberry.field
    def me(self, info: Info) -> User:
        current_user = info.context["current_user"]
        if current_user is None:
            raise Exception("Not authenticated")
        return to_graphql_user(current_user)


@strawberry.type
class AuthMutation:
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
