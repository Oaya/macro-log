from datetime import date

import strawberry
from sqlalchemy import select
from strawberry.types import Info

from database import SessionLocal
from gql.converters import to_graphql_user
from gql.types import BodyWeightType, Sex, UnitPreference, User
from models import BodyWeight as BodyWeightModel
from models import User as UserModel


@strawberry.type
class UserQuery:
    @strawberry.field
    def body_weights(
        self, info: Info, recorded_date: date | None = None
    ) -> list[BodyWeightType]:
        current_user = info.context["current_user"]

        if current_user is None:
            raise Exception("Not authenticated")

        db = SessionLocal()

        try:
            query = select(BodyWeightModel).where(
                BodyWeightModel.user_id == current_user.id
            )
            if recorded_date is not None:
                query = query.where(BodyWeightModel.recorded_date == recorded_date)
            query = query.order_by(BodyWeightModel.recorded_date)

            db_weights = db.execute(query).scalars().all()
            return [
                BodyWeightType(
                    id=strawberry.ID(str(w.id)),
                    weight_kg=w.weight_kg,
                    recorded_date=str(w.recorded_date),
                )
                for w in db_weights
            ]
        finally:
            db.close()


@strawberry.type
class UserMutation:
    @strawberry.mutation
    def record_weight(
        self,
        info: Info,
        weight_kg: float,
        recorded_date: date | None = None,
    ) -> BodyWeightType:
        current_user = info.context["current_user"]

        if current_user is None:
            raise Exception("Not authenticated")

        target_date = recorded_date or date.today()

        db = SessionLocal()

        try:
            # Check if an entry already exists for this user + date
            existing = db.execute(
                select(BodyWeightModel).where(
                    BodyWeightModel.user_id == current_user.id,
                    BodyWeightModel.recorded_date == target_date,
                )
            ).scalar_one_or_none()

            if existing:
                existing.weight_kg = weight_kg
                db_weight = existing

            else:
                db_weight = BodyWeightModel(
                    user_id=current_user.id,
                    weight_kg=weight_kg,
                    recorded_date=target_date,
                )

            db.add(db_weight)
            db.commit()
            db.refresh(db_weight)

            return BodyWeightType(
                id=strawberry.ID(str(db_weight.id)),
                weight_kg=db_weight.weight_kg,
                recorded_date=str(db_weight.recorded_date),
            )
        finally:
            db.close()

    @strawberry.mutation
    def update_profile(
        self,
        info: Info,
        height_cm: float | None = None,
        sex: Sex | None = None,
        date_of_birth: date | None = None,
        unit_preference: UnitPreference | None = None,
    ) -> User:
        current_user = info.context["current_user"]
        if current_user is None:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            # FETCH the existing user — do NOT create a new one
            db_user = db.get(UserModel, current_user.id)
            if db_user is None:
                raise Exception("User not found")

            # Modify only provided fields
            if height_cm is not None:
                db_user.height_cm = height_cm
            if sex is not None:
                db_user.sex = sex.value  # enum -> string
            if date_of_birth is not None:
                db_user.date_of_birth = date_of_birth
            if unit_preference is not None:
                db_user.unit_preference = unit_preference.value  # enum -> string

            db.commit()
            db.refresh(db_user)
            return to_graphql_user(db_user)
        finally:
            db.close()
