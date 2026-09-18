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

// Convert what the user typed back into cm before sending it to the backend.
export function displayLengthToCm(value: string, isImperial: boolean) {
	const length = parseFloat(value);

	if (isNaN(length) || length <= 0) {
		return null;
	}

	if (isImperial) {
		return Number((length * 2.54).toFixed(2));
	}

	return Number(length.toFixed(2));
}

// Backend always stores cm. Convert backend cm into a plain editable number in whatever unit the user should see.
export function cmToDisplayLength(cm: number | null, isImperial: boolean) {
	if (cm == null) {
		return "";
	}

	if (isImperial) {
		return (cm / 2.54).toFixed(1);
	}

	return cm.toString();
}

//Backend always stores cm. Convert backend cm into whatever unit the user should see.
export function cmToDisplayHeight(value: string | null, isImperial: boolean) {
	if (value == null) {
		return "";
	}

	const cm = parseFloat(value);

	if (isNaN(cm)) {
		return "";
	}

	if (isImperial) {
		const totalInches = cm / 2.54;
		const feet = Math.floor(totalInches / 12);
		const inches = Math.round(totalInches % 12);
		return `${feet}'${inches}"`;
	}

	return `${cm} cm`;
}
