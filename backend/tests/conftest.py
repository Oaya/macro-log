import uuid

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    """Register a new user and return auth headers with their token."""
    unique = uuid.uuid4().hex[:8]
    email = f"test_{unique}@example.com"
    response = client.post(
        "/graphql",
        json={
            "query": f'''
            mutation {{
              register(email: "{email}", password: "password123", username: "test_{unique}") {{
                token
              }}
            }}
        '''
        },
    )
    token = response.json()["data"]["register"]["token"]
    return {"Authorization": f"Bearer {token}"}
