def test_log_food(client, auth_headers):
    response = client.post(
        "/graphql",
        json={
            "query": """
            mutation {
              logFood(
                food: {name: "Chicken", calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6}
                quantity: 2
                mealType: LUNCH
                logDate: "2026-09-08"
              ) { foodName quantity }
            }
        """
        },
        headers=auth_headers,
    )
    data = response.json()
    assert "errors" not in data
    assert data["data"]["logFood"]["foodName"] == "Chicken"


def test_log_food_without_token_fails(client):
    response = client.post(
        "/graphql",
        json={
            "query": """
            mutation {
              logFood(
                food: {name: "Chicken", calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6}
                quantity: 1
                mealType: LUNCH
              ) { foodName }
            }
        """
        },
    )
    assert "errors" in response.json()


def test_food_logs(client, auth_headers):
    client.post(
        "/graphql",
        json={
            "query": """
            mutation {
              logFood(
                food: {name: "Rice", calories: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3}
                quantity: 1
                mealType: DINNER
                logDate: "2026-09-08"
              ) { foodName }
            }
        """
        },
        headers=auth_headers,
    )
    response = client.post(
        "/graphql",
        json={"query": 'query { foodLogs(logDate: "2026-09-08") { foodName } }'},
        headers=auth_headers,
    )
    data = response.json()
    assert "errors" not in data
    assert len(data["data"]["foodLogs"]) >= 1
