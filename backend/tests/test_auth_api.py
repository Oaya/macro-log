import uuid


def register_user(client, email=None, password="password123"):
    email = email or f"test_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/graphql",
        json={
            "query": f'''
            mutation {{
              register(email: "{email}", password: "{password}") {{
                token
                user {{ id email }}
              }}
            }}
        '''
        },
    )
    return response.json(), email


def test_register_creates_user(client):
    data, email = register_user(client)
    assert "errors" not in data
    assert data["data"]["register"]["user"]["email"] == email
    assert data["data"]["register"]["token"]


def test_register_duplicate_email_fails(client):
    _, email = register_user(client)
    data, _ = register_user(client, email=email)
    assert "errors" in data


def test_login_correct_password(client):
    _, email = register_user(client)
    response = client.post(
        "/graphql",
        json={
            "query": f'''
            mutation {{
              login(email: "{email}", password: "password123") {{ token }}
            }}
        '''
        },
    )
    data = response.json()
    assert "errors" not in data
    assert data["data"]["login"]["token"]


def test_login_wrong_password_fails(client):
    _, email = register_user(client)
    response = client.post(
        "/graphql",
        json={
            "query": f'''
            mutation {{
              login(email: "{email}", password: "wrongpass") {{ token }}
            }}
        '''
        },
    )
    assert "errors" in response.json()
