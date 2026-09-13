import { useAuth } from "@/lib/auth-context";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type MeData = {
	me: { email: string };
};

const ME: TypedDocumentNode<MeData> = gql`
	query {
		me {
			email
		}
	}
`;

export default function Index() {
	const { data: meData, loading, error } = useQuery(ME);
	const router = useRouter();
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		router.replace("/login");
	};

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
				<Text>Loading...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Error: {error.message}</Text>
			</View>
		);
	}

	return (
		<View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
			{meData?.me && <Text> Logged in as : {meData.me.email}</Text>}

			<Pressable onPress={handleLogout}>
				<Text>Log out</Text>
			</Pressable>
		</View>
	);
}
