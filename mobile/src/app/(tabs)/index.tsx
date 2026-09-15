import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
	const router = useRouter();
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		router.replace("/login");
	};

	return (
		<View style={{ flex: 1, backgroundColor: "#F4F6F9", padding: 20, paddingTop: 60 }}>
			<Pressable onPress={handleLogout}>
				<Text>Log out</Text>
			</Pressable>
		</View>
	);
}
