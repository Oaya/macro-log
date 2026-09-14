import { Tabs } from "expo-router";

export default function TabsLayout() {
	return (
		<Tabs screenOptions={{ headerShown: true }}>
			<Tabs.Screen
				name="index"
				options={{ title: "Home" }}
			/>
			<Tabs.Screen
				name="summary"
				options={{ title: "Summary" }}
			/>
			<Tabs.Screen
				name="log"
				options={{ title: "Log" }}
			/>
			<Tabs.Screen
				name="profile"
				options={{ title: "Profile" }}
			/>
		</Tabs>
	);
}
