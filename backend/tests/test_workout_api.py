def test_exercises_public(client):
    # exercises is public — no token needed
    response = client.post(
        "/graphql",
        json={"query": "query { exercises { id name } }"},
    )
    data = response.json()
    assert "errors" not in data
    # Requires seed data — may be empty if test DB isn't seeded
    assert isinstance(data["data"]["exercises"], list)
