import { useAuth } from "@/lib/auth-context";
import { Pressable, Text, View } from "react-native";

export default function profile() {
	const { logout } = useAuth();

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				gap: 20,
			}}
		>
			<Text style={{ fontSize: 20 }}>Profile</Text>
			<Pressable
				onPress={logout}
				style={{ backgroundColor: "#000", padding: 16, borderRadius: 8 }}
			>
				<Text style={{ color: "#fff" }}>Log out</Text>
			</Pressable>
		</View>
	);
}
