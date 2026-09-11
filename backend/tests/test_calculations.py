import pytest

from calculations import (
    CAL_PER_G,
    MIN_SAFE_CALORIES,
    calculate_bmr,
    calculate_goal,
    calculate_macros,
)


class TestCalculateBmr:
    def test_male(self):
        # 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
        assert calculate_bmr(weight_kg=80, height_cm=180, age=30, sex="MALE") == 1780

    def test_female(self):
        # 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
        assert calculate_bmr(
            weight_kg=60, height_cm=165, age=25, sex="FEMALE"
        ) == pytest.approx(1345.25)

    def test_male_and_female_differ_by_166(self):
        male = calculate_bmr(weight_kg=70, height_cm=170, age=40, sex="MALE")
        female = calculate_bmr(weight_kg=70, height_cm=170, age=40, sex="FEMALE")
        assert male - female == 166

    def test_higher_weight_increases_bmr(self):
        lighter = calculate_bmr(weight_kg=60, height_cm=170, age=30, sex="MALE")
        heavier = calculate_bmr(weight_kg=90, height_cm=170, age=30, sex="MALE")
        assert heavier > lighter

    def test_older_age_decreases_bmr(self):
        younger = calculate_bmr(weight_kg=70, height_cm=170, age=20, sex="MALE")
        older = calculate_bmr(weight_kg=70, height_cm=170, age=60, sex="MALE")
        assert older < younger


class TestCalculateMacros:
    def test_split_sums_back_to_daily_calories(self):
        daily_calories = 2000
        macros = calculate_macros(daily_calories)
        recomputed = (
            macros["protein_g"] * CAL_PER_G["protein"]
            + macros["carbs_g"] * CAL_PER_G["carbs"]
            + macros["fat_g"] * CAL_PER_G["fat"]
        )
        assert recomputed == pytest.approx(daily_calories, abs=5)

    def test_known_values(self):
        # 2000 cal: protein 30% = 600cal/4 = 150g, carbs 40% = 800cal/4 = 200g,
        # fat 30% = 600cal/9 = 66.67g -> rounds to 67
        macros = calculate_macros(2000)
        assert macros == {"protein_g": 150, "carbs_g": 200, "fat_g": 67}

    def test_zero_calories(self):
        macros = calculate_macros(0)
        assert macros == {"protein_g": 0, "carbs_g": 0, "fat_g": 0}

    def test_returns_ints(self):
        macros = calculate_macros(1837)
        for value in macros.values():
            assert isinstance(value, int)


class TestCalculateGoal:
    def test_weight_loss_goal(self):
        result = calculate_goal(
            weight_kg=90,
            height_cm=180,
            age=30,
            sex="MALE",
            activity_level="MODERATE",
            current_weight=90,
            target_weight=80,
            days=100,
        )
        bmr = calculate_bmr(90, 180, 30, "MALE")
        tdee = bmr * 1.55
        daily_deficit = (90 - 80) * 7700 / 100
        expected_calories = round(tdee - daily_deficit)
        assert result["daily_calories"] == expected_calories
        assert result["protein_g"] > 0
        assert result["carbs_g"] > 0
        assert result["fat_g"] > 0

    def test_weight_gain_goal_increases_calories_above_tdee(self):
        bmr = calculate_bmr(70, 175, 25, "MALE")
        tdee = bmr * 1.55
        result = calculate_goal(
            weight_kg=70,
            height_cm=175,
            age=25,
            sex="MALE",
            activity_level="MODERATE",
            current_weight=70,
            target_weight=80,
            days=100,
        )
        assert result["daily_calories"] > tdee

    def test_maintenance_goal_equals_tdee(self):
        bmr = calculate_bmr(70, 175, 25, "FEMALE")
        tdee = bmr * 1.375
        result = calculate_goal(
            weight_kg=70,
            height_cm=175,
            age=25,
            sex="FEMALE",
            activity_level="LIGHT",
            current_weight=70,
            target_weight=70,
            days=90,
        )
        assert result["daily_calories"] == round(tdee)

    def test_safety_floor_triggers_on_aggressive_deficit(self):
        # Huge deficit over a short window should be floored, not go negative.
        result = calculate_goal(
            weight_kg=100,
            height_cm=170,
            age=40,
            sex="FEMALE",
            activity_level="SEDENTARY",
            current_weight=100,
            target_weight=60,
            days=7,
        )
        assert result["daily_calories"] == MIN_SAFE_CALORIES

    def test_all_activity_levels_accepted(self):
        for level in ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE"]:
            result = calculate_goal(
                weight_kg=75,
                height_cm=175,
                age=30,
                sex="MALE",
                activity_level=level,
                current_weight=75,
                target_weight=70,
                days=60,
            )
            assert result["daily_calories"] > 0

    def test_unknown_activity_level_raises(self):
        with pytest.raises(KeyError):
            calculate_goal(
                weight_kg=75,
                height_cm=175,
                age=30,
                sex="MALE",
                activity_level="EXTREME",
                current_weight=75,
                target_weight=70,
                days=60,
            )

    def test_result_contains_macro_keys(self):
        result = calculate_goal(
            weight_kg=75,
            height_cm=175,
            age=30,
            sex="MALE",
            activity_level="MODERATE",
            current_weight=75,
            target_weight=70,
            days=60,
        )
        assert set(result.keys()) == {
            "daily_calories",
            "protein_g",
            "carbs_g",
            "fat_g",
        }
