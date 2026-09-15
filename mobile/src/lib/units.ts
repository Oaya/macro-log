// Convert what the user typed back into kg before sending it to the backend.
export function displayWeightToKg(value: string, isImperial: boolean) {
	const weight = parseFloat(value);

	if (isNaN(weight) || weight <= 0) {
		return null;
	}

	if (isImperial) {
		return Number((weight / 2.20462).toFixed(2));
	}

	return Number(weight.toFixed(2));
}

//Backend always stores kg. Convert backend kg into whatever unit the user should see.
export function kgToDisplayWeight(kg: number | null, isImperial: boolean) {
	if (kg == null) {
		return "";
	}

	if (isImperial) {
		const pounds = kg * 2.20462;
		return pounds.toFixed(1);
	}

	return kg.toString();
}
