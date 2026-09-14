import { Stack } from "expo-router";

export default function MoreLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{ title: "More" }}
			/>
			<Stack.Screen
				name="profile"
				options={{ title: "My Profile" }}
			/>
		</Stack>
	);
}
