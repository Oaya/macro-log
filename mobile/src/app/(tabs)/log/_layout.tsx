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
				name="log-body-stats"
				options={{ title: "Log Body Stats" }}
			/>
			<Stack.Screen
				name="create-food"
				options={{ title: "Create Food" }}
			/>
		</Stack>
	);
}
