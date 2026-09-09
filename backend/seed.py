"""Seed the database with a starter set of common exercises."""

from database import SessionLocal
from models import Exercise

EXERCISES = [
    # Strength
    ("Bench Press", "STRENGTH", 5.0),
    ("Squat", "STRENGTH", 5.0),
    ("Deadlift", "STRENGTH", 6.0),
    ("Overhead Press", "STRENGTH", 5.0),
    ("Pull-up", "STRENGTH", 8.0),
    ("Push-up", "STRENGTH", 8.0),
    ("Bicep Curl", "STRENGTH", 3.5),
    ("Lunge", "STRENGTH", 4.0),
    ("Plank", "STRENGTH", 3.0),
    ("Leg Press", "STRENGTH", 5.0),
    ("Shoulder Press", "STRENGTH", 5.0),
    ("Tricep Dip", "STRENGTH", 5.0),
    # Cardio
    ("Running", "CARDIO", 10.0),
    ("Cycling", "CARDIO", 8.0),
    ("Swimming", "CARDIO", 7.0),
    ("Walking", "CARDIO", 3.5),
    ("Rowing", "CARDIO", 7.0),
    ("Jump Rope", "CARDIO", 12.0),
    ("Elliptical", "CARDIO", 5.0),
    ("Hiking", "CARDIO", 6.0),
    ("Dancing", "CARDIO", 5.0),
    ("HIIT", "CARDIO", 8.0),
    # Flexibility
    ("Yoga", "FLEXIBILITY", 2.5),
    ("Stretching", "FLEXIBILITY", 2.5),
    ("Pilates", "FLEXIBILITY", 3.0),
]


def seed_exercises():
    db = SessionLocal()
    try:
        for name, ex_type, met_val in EXERCISES:
            # Skip if already exists (idempotent — safe to re-run)
            if db.query(Exercise).filter(Exercise.name == name).first():
                continue
            db.add(
                Exercise(
                    name=name,
                    type=ex_type,
                    met_value=met_val,
                )
            )
        db.commit()
        print("Seeded exercises (skipped any that already existed).")
    finally:
        db.close()


if __name__ == "__main__":
    seed_exercises()
