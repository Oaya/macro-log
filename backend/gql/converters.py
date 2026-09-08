from datetime import date

import strawberry

from gql.types import Sex, UnitPreference, User
from models import User as UserModel


#  Helper: convert a SQLAlchemy User -> a GraphQL User
#  (drops password_hash, formats fields for the API)
def to_graphql_user(db_user: UserModel) -> User:
    return User(
        id=strawberry.ID(str(db_user.id)),
        email=db_user.email,
        created_at=str(db_user.created_at),
        height_cm=db_user.height_cm,
        date_of_birth=str(db_user.date_of_birth) if db_user.date_of_birth else None,
        sex=Sex(db_user.sex) if db_user.sex else None,
        unit_preference=UnitPreference(db_user.unit_preference),
    )


def calculate_age(dob: date) -> int:
    today = date.today()
    # subtract 1 if this year's birthday hasn't happened yet
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
