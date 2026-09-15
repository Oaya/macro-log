import uuid


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


def test_latest_body_weight_returns_most_recently_dated_entry(client, auth_headers):
    # Record an older entry, then a newer one out of order
    for weight, recorded_date in [(80, "2026-09-01"), (78, "2026-09-10"), (79, "2026-09-05")]:
        client.post(
            "/graphql",
            json={
                "query": f"""
                mutation {{
                  recordWeight(weightKg: {weight}, recordedDate: "{recorded_date}") {{ weightKg }}
                }}
            """
            },
            headers=auth_headers,
        )

    response = client.post(
        "/graphql",
        json={"query": "query { latestBodyWeight { weightKg recordedDate } }"},
        headers=auth_headers,
    )
    data = response.json()
    assert "errors" not in data
    assert data["data"]["latestBodyWeight"]["weightKg"] == 78
    assert data["data"]["latestBodyWeight"]["recordedDate"] == "2026-09-10"


def test_latest_body_weight_null_when_none_recorded(client, auth_headers):
    response = client.post(
        "/graphql",
        json={"query": "query { latestBodyWeight { weightKg } }"},
        headers=auth_headers,
    )
    data = response.json()
    assert "errors" not in data
    assert data["data"]["latestBodyWeight"] is None


def test_latest_body_weight_without_token_fails(client):
    response = client.post(
        "/graphql",
        json={"query": "query { latestBodyWeight { weightKg } }"},
    )
    assert "errors" in response.json()


def test_latest_body_weight_only_returns_own_data(client, auth_headers):
    client.post(
        "/graphql",
        json={
            "query": """
            mutation {
              recordWeight(weightKg: 60, recordedDate: "2026-09-12") { weightKg }
            }
        """
        },
        headers=auth_headers,
    )

    # A different user with no entries of their own should see null,
    # not the first user's weight.
    other_unique = uuid.uuid4().hex[:8]
    other_email = f"test_{other_unique}@example.com"
    register_response = client.post(
        "/graphql",
        json={
            "query": f"""
            mutation {{
              register(email: "{other_email}", password: "password123", username: "test_{other_unique}") {{ token }}
            }}
        """
        },
    )
    other_headers = {
        "Authorization": f"Bearer {register_response.json()['data']['register']['token']}"
    }

    response = client.post(
        "/graphql",
        json={"query": "query { latestBodyWeight { weightKg } }"},
        headers=other_headers,
    )
    data = response.json()
    assert "errors" not in data
    assert data["data"]["latestBodyWeight"] is None
