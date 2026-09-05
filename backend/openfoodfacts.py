import httpx

# Search-a-licious endpoint (POST-based full-text search)
SEARCH_URL = "https://search.openfoodfacts.org/search"

HEADERS = {"User-Agent": "MacroLog/1.0 (youremail@example.com)"}


def search_foods(query: str, limit: int = 30) -> list[dict]:
    """
    Search Open Food Facts via the Search-a-licious API (full-text).
    Returns a list of clean dicts. Skips products missing name or calories.
    """
    # Search-a-licious uses POST with a JSON body.
    payload = {
        "q": query,
        "page_size": limit,
        # Only fetch the fields we need (faster, smaller response).
        "fields": ["product_name", "code", "serving_size", "nutriments"],
    }

    try:
        response = httpx.post(SEARCH_URL, json=payload, headers=HEADERS, timeout=10.0)
        response.raise_for_status()
        data = response.json()
    except httpx.HTTPError:
        # API unavailable — degrade gracefully instead of crashing.
        return []

    results = []
    # Search-a-licious returns results under "hits".
    for product in data.get("hits", []):
        name = (product.get("product_name") or "").strip()
        nutriments = product.get("nutriments", {})
        calories = nutriments.get("energy-kcal_100g")

        # Skip incomplete products.
        if not name or calories is None:
            continue

        # Sodium is in grams; convert to milligrams.
        sodium_g = nutriments.get("sodium_100g")
        sodium_mg = sodium_g * 1000 if sodium_g is not None else None

        results.append(
            {
                "name": name,
                "barcode": product.get("code"),
                "serving_size": product.get("serving_size"),
                "calories": calories,
                "protein_g": nutriments.get("proteins_100g", 0.0),
                "carbs_g": nutriments.get("carbohydrates_100g", 0.0),
                "fat_g": nutriments.get("fat_100g", 0.0),
                "fiber_g": nutriments.get("fiber_100g"),
                "sodium_mg": sodium_mg,
            }
        )

    return results
