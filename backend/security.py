import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str) -> str:
    """Hash a plain password with bcrypt for safe storage."""

    # bcrypt works with bytes, so encode the password first.
    password_bytes = password.encode("utf-8")
    # gensalt() creates a random salt. hashpw combines it with the password.
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

    return hashed.decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Check a plain password against a stored bcrypt hash."""

    # Both must be bytes for checkpw.
    password_bytes = password.encode("utf-8")
    hashed_bytes = hashed.encode("utf-8")

    # checkpw re-hashes using the salt inside 'hashed' and compares safely.
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(user_id: str) -> str:
    """Create a signed JWT that identifies the user."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),  # subject = who this token is for
        "exp": expire,
    }
    # Sign the payload with our secret. This makes it tamper-proof.
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> str | None:
    """Verify a JWT and return the user id inside it.
    Returns None if the token is invalid, expired, or tampered with."""

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=JWT_ALGORITHM)
        print(payload)

        # "sub" is user_id exists.
        user_id = payload.get("sub")
        return user_id

    except jwt.PyJWTError:
        return None
