import os

import httpx

# USDA FoodData Central — free, reliable government API.
SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

USDA_API_KEY = os.getenv("USDA_API_KEY", "DEMO_KEY")  # DEMO_KEY is heavily rate-limited

# USDA nutrient IDs we care about (from their standard nutrient reference).
# Used to look up values in each food's `foodNutrients[].nutrientId`.
NUTRIENT_IDS = {
    "calories": 1008,  # Energy (kcal)
    "protein_g": 1003,
    "fat_g": 1004,
    "carbs_g": 1005,
    "fiber_g": 1079,
    "sodium_mg": 1093,  # already in milligrams — no conversion needed
}

# Same nutrients, but as USDA "nutrient numbers" — a different numbering
# scheme the search API's `nutrients` filter param expects (not nutrientId).
NUTRIENT_NUMBERS = {
    "calories": 208,
    "protein_g": 203,
    "fat_g": 204,
    "carbs_g": 205,
    "fiber_g": 291,
    "sodium_mg": 307,
}


def search_foods(query: str, limit: int = 1) -> list[dict]:
    """
    Search USDA FoodData Central for foods matching `query`.
    Returns a list of clean dicts, same shape as before (nutriment values,
    macros per the food's reported serving — USDA reports per 100g by default
    for most entries). Skips items missing a name or calories.
    """
    params = {
        "query": query,
        "pageSize": limit,
        "api_key": USDA_API_KEY,
        "nutrients": list(NUTRIENT_NUMBERS.values()),
        "dataType": "Foundation,SR Legacy,Branded",
    }

    try:
        response = httpx.get(SEARCH_URL, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()
    except httpx.HTTPError:
        # API unavailable — degrade gracefully instead of crashing.
        return []

    results = []

    for food in data.get("foods", []):
        # Build a lookup of nutrientId -> value for this food.
        nutrient_lookup = {
            n["nutrientId"]: n.get("value")
            for n in food.get("foodNutrients", [])
            if "nutrientId" in n
        }

        calories = nutrient_lookup.get(NUTRIENT_IDS["calories"])
        if calories is None:
            continue  # skip items with no calorie data

        brands_raw = food.get("brandOwner") or food.get("brandName")
        brands = [brands_raw.strip()] if brands_raw else None

        serving_size_value = food.get("servingSize")
        serving_size_unit = food.get("servingSizeUnit", "")
        if serving_size_value:
            serving_size = f"{serving_size_value}{serving_size_unit}"
        else:
            serving_size = "100g"

        results.append(
            {
                "name": (food.get("description") or "").strip(),
                "brands": brands,
                "id": (str(food["fdcId"]) if food.get("fdcId") is not None else None),
                "calories": calories,
                "protein_g": nutrient_lookup.get(NUTRIENT_IDS["protein_g"], 0.0),
                "carbs_g": nutrient_lookup.get(NUTRIENT_IDS["carbs_g"], 0.0),
                "fat_g": nutrient_lookup.get(NUTRIENT_IDS["fat_g"], 0.0),
                "fiber_g": nutrient_lookup.get(NUTRIENT_IDS["fiber_g"]),
                "sodium_mg": nutrient_lookup.get(NUTRIENT_IDS["sodium_mg"]),
                "serving_size": serving_size,
            }
        )

    return results
