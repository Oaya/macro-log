import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Read the connection string from the environment.
# Docker Compose injects DATABASE_URL (host "db", remember).
# The fallback is only for running outside Docker.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://macro:macro_pass@localhost:5432/macrolog",
)

# The engine is the core connection pool to the database.
engine = create_engine(DATABASE_URL)

# A session factory. Each request gets a session to run queries/commits.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class your models will inherit from.
# Alembic and SQLAlchemy use it to know what tables exist.


class Base(DeclarativeBase):
    pass
