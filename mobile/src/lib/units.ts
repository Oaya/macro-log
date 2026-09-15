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
