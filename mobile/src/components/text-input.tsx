import { useState } from "react";
import {
	TextInput as RNTextInput,
	type TextInputProps,
} from "react-native";

// Tapping a filled TextInput otherwise drops the caret wherever you tapped
// (often the start), making it awkward to append a new value. This puts the
// caret at the end on focus, then releases control so typing behaves normally.
export function TextInput({ value, onFocus, ...props }: TextInputProps) {
	const [selection, setSelection] = useState<
		{ start: number; end: number } | undefined
	>(undefined);

	return (
		<RNTextInput
			value={value}
			selection={selection}
			onFocus={(e) => {
				const end = value?.length ?? 0;
				setSelection({ start: end, end });
				setTimeout(() => setSelection(undefined), 0);
				onFocus?.(e);
			}}
			{...props}
		/>
	);
}
