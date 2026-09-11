CALORIES_PER_KG = 7700
MIN_SAFE_CALORIES = 1200

# calories per gram
CAL_PER_G = {"protein": 4, "carbs": 4, "fat": 9}

# default macro split (% of calories)
MACRO_SPLIT = {"protein": 0.30, "carbs": 0.40, "fat": 0.30}


def calculate_bmr(weight_kg, height_cm, age, sex):
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    return base + 5 if sex == "MALE" else base - 161


def calculate_macros(daily_calories):
    """Split daily calories into protein/carbs/fat grams."""
    return {
        "protein_g": round(
            daily_calories * MACRO_SPLIT["protein"] / CAL_PER_G["protein"]
        ),
        "carbs_g": round(daily_calories * MACRO_SPLIT["carbs"] / CAL_PER_G["carbs"]),
        "fat_g": round(daily_calories * MACRO_SPLIT["fat"] / CAL_PER_G["fat"]),
    }


ACTIVITY_FACTORS = {
    "SEDENTARY": 1.2,
    "LIGHT": 1.375,
    "MODERATE": 1.55,
    "ACTIVE": 1.725,
}


def calculate_goal(
    weight_kg, height_cm, age, sex, activity_level, current_weight, target_weight, days
):
    bmr = calculate_bmr(weight_kg, height_cm, age, sex)
    tdee = bmr * ACTIVITY_FACTORS[activity_level]

    total_deficit = (current_weight - target_weight) * CALORIES_PER_KG
    daily_deficit = total_deficit / days
    daily_calories = max(tdee - daily_deficit, MIN_SAFE_CALORIES)

    macros = calculate_macros(daily_calories)
    return {
        "daily_calories": round(daily_calories),
        **macros,
    }
