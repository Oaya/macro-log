import strawberry

from gql.types import User
from models import User as UserModel


#  Helper: convert a SQLAlchemy User -> a GraphQL User
#  (drops password_hash, formats fields for the API)
def to_graphql_user(db_user: UserModel) -> User:
    return User(
        id=strawberry.ID(str(db_user.id)),
        email=db_user.email,
        created_at=str(db_user.created_at),
    )
