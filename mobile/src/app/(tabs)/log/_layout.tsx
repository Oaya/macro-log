import { Stack } from "expo-router";

export default function LogLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{ title: "Log" }}
			/>
			<Stack.Screen
				name="food"
				options={{ title: "Log Food" }}
			/>
			<Stack.Screen
				name="workout"
				options={{ title: "Log Workout" }}
			/>
			<Stack.Screen
				name="weight"
				options={{ title: "Log Weight" }}
			/>
		</Stack>
	);
}
