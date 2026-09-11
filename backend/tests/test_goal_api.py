def test_set_weight_goal_incomplete_profile_fails(client, auth_headers):
    # New user has no height/dob/sex/weight → should error
    response = client.post(
        "/graphql",
        json={
            "query": """
            mutation {
              setWeightGoal(targetWeightKg: 70, targetDate: "2026-12-01", activityLevel: "MODERATE") {
                dailyCalories
              }
            }
        """
        },
        headers=auth_headers,
    )
    assert "errors" in response.json()  # incomplete profile rejected
