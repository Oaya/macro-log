import uuid
from datetime import date

import strawberry
from sqlalchemy import select
from strawberry.types import Info

from database import SessionLocal
from gql.context import require_user
from gql.converters import to_graphql_user
from gql.types import BodyMeasurement, Sex, UnitPreference, User
from models import BodyMeasurement as BodyMeasurementModel
from models import User as UserModel


@strawberry.type
class UserQuery:
    @strawberry.field
    def body_weights(
        self, info: Info, recorded_date: date | None = None
    ) -> list[BodyMeasurement]:
        current_user = require_user(info)

        db = SessionLocal()

        try:
            query = select(BodyMeasurementModel).where(
                BodyMeasurementModel.user_id == current_user.id
            )
            if recorded_date is not None:
                query = query.where(BodyMeasurementModel.recorded_date == recorded_date)
            query = query.order_by(
                BodyMeasurementModel.recorded_date.desc(),
            )

            db_weights = db.execute(query).scalars().all()
            return [
                BodyMeasurement(
                    id=strawberry.ID(str(w.id)),
                    weight_kg=w.weight_kg,
                    recorded_date=str(w.recorded_date),
                    waist_cm=w.waist_cm,
                    hip_cm=w.hip_cm,
                    chest_cm=w.chest_cm,
                    arm_cm=w.arm_cm,
                    thigh_cm=w.thigh_cm,
                )
                for w in db_weights
            ]
        finally:
            db.close()

    @strawberry.field
    def today_body_stats(
        self, info: Info, recorded_date: date
    ) -> BodyMeasurement | None:
        current_user = require_user(info)

        db = SessionLocal()

        try:
            db_weight = db.execute(
                select(BodyMeasurementModel)
                .where(
                    BodyMeasurementModel.user_id == current_user.id,
                    BodyMeasurementModel.recorded_date == recorded_date,
                )
                .limit(1)
            ).scalar_one_or_none()

            if db_weight is None:
                return None

            return BodyMeasurement(
                id=strawberry.ID(str(db_weight.id)),
                weight_kg=db_weight.weight_kg,
                recorded_date=str(db_weight.recorded_date),
                waist_cm=db_weight.waist_cm,
                hip_cm=db_weight.hip_cm,
                chest_cm=db_weight.chest_cm,
                arm_cm=db_weight.arm_cm,
                thigh_cm=db_weight.thigh_cm,
            )
        finally:
            db.close()


@strawberry.type
class UserMutation:
    @strawberry.mutation
    def record_body_stats(
        self,
        info: Info,
        weight_kg: float | None = None,
        waist_cm: float | None = None,
        hip_cm: float | None = None,
        chest_cm: float | None = None,
        arm_cm: float | None = None,
        thigh_cm: float | None = None,
        recorded_date: date | None = None,
    ) -> BodyMeasurement:
        current_user = require_user(info)

        target_date = recorded_date or date.today()

        db = SessionLocal()

        try:
            # Check if an entry already exists for this user + date
            existing = db.execute(
                select(BodyMeasurementModel).where(
                    BodyMeasurementModel.user_id == current_user.id,
                    BodyMeasurementModel.recorded_date == target_date,
                )
            ).scalar_one_or_none()

            if existing:
                if weight_kg is not None:
                    existing.weight_kg = weight_kg
                if waist_cm is not None:
                    existing.waist_cm = waist_cm
                if hip_cm is not None:
                    existing.hip_cm = hip_cm
                if chest_cm is not None:
                    existing.chest_cm = chest_cm
                if arm_cm is not None:
                    existing.arm_cm = arm_cm
                if thigh_cm is not None:
                    existing.thigh_cm = thigh_cm
                db_weight = existing

            else:
                db_weight = BodyMeasurementModel(
                    user_id=current_user.id,
                    weight_kg=weight_kg,
                    waist_cm=waist_cm,
                    hip_cm=hip_cm,
                    chest_cm=chest_cm,
                    arm_cm=arm_cm,
                    thigh_cm=thigh_cm,
                    recorded_date=target_date,
                )

            db.add(db_weight)
            db.commit()
            db.refresh(db_weight)

            return BodyMeasurement(
                id=strawberry.ID(str(db_weight.id)),
                weight_kg=db_weight.weight_kg,
                recorded_date=str(db_weight.recorded_date),
                waist_cm=db_weight.waist_cm,
                hip_cm=db_weight.hip_cm,
                chest_cm=db_weight.chest_cm,
                arm_cm=db_weight.arm_cm,
                thigh_cm=db_weight.thigh_cm,
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
        current_user = require_user(info)

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

    @strawberry.mutation
    def delete_body_weight(self, info: Info, id: strawberry.ID) -> bool:

        current_user = require_user(info)

        db = SessionLocal()

        try:
            log = db.get(BodyMeasurementModel, uuid.UUID(str(id)))
            if log is None:
                raise Exception("BodyMeasurement log not found")

            if log.user_id != current_user.id:
                raise Exception("Not authorized to delete this log")

            db.delete(log)
            db.commit()
            return True
        finally:
            db.close()
