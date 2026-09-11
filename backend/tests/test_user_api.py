def test_me_returns_user(client, auth_headers):
    response = client.post(
        "/graphql",
        json={"query": "query { me { email } }"},
        headers=auth_headers,
    )
    data = response.json()
    assert "errors" not in data
    assert "@example.com" in data["data"]["me"]["email"]


def test_me_without_token_fails(client):
    response = client.post(
        "/graphql",
        json={"query": "query { me { email } }"},
    )
    assert "errors" in response.json()


def test_update_profile(client, auth_headers):
    response = client.post(
        "/graphql",
        json={
            "query": """
            mutation {
              updateProfile(heightCm: 178) { heightCm }
            }
        """
        },
        headers=auth_headers,
    )
    data = response.json()
    assert "errors" not in data
    assert data["data"]["updateProfile"]["heightCm"] == 178


def test_record_weight(client, auth_headers):
    response = client.post(
        "/graphql",
        json={
            "query": """
            mutation {
              recordWeight(weightKg: 75, recordedDate: "2026-09-08") {
                weightKg recordedDate
              }
            }
        """
        },
        headers=auth_headers,
    )
    data = response.json()
    assert "errors" not in data
    assert data["data"]["recordWeight"]["weightKg"] == 75


def test_record_weight_without_token_fails(client):
    response = client.post(
        "/graphql",
        json={
            "query": """
            mutation { recordWeight(weightKg: 75) { weightKg } }
        """
        },
    )
    assert "errors" in response.json()


def test_body_weights(client, auth_headers):
    # Record one first
    client.post(
        "/graphql",
        json={
            "query": """
            mutation {
              recordWeight(weightKg: 75, recordedDate: "2026-09-08") { weightKg }
            }
        """
        },
        headers=auth_headers,
    )
    # Then query
    response = client.post(
        "/graphql",
        json={"query": "query { bodyWeights { weightKg recordedDate } }"},
        headers=auth_headers,
    )
    data = response.json()
    assert "errors" not in data
    assert len(data["data"]["bodyWeights"]) >= 1
