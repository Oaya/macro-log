import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ApolloProvider } from "@apollo/client/react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ReactNode, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { client } from "../lib/apollo";

function AuthGate({ children }: { children: ReactNode }) {
	const { checking, loggedIn } = useAuth();
	const router = useRouter();
	const segments = useSegments();

	useEffect(() => {
		if (checking) return;
		const inAuthScreen = segments[0] === "login" || segments[0] === "register";

		if (!loggedIn && !inAuthScreen) {
			router.replace("/login");
		} else if (loggedIn && inAuthScreen) {
			router.replace("/");
		}
	}, [checking, loggedIn, segments]);

	if (checking) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return <>{children}</>;
}

export default function RootLayout() {
	return (
		<ApolloProvider client={client}>
			<AuthProvider>
				<AuthGate>
					<Stack screenOptions={{ headerShown: false }} />
				</AuthGate>
			</AuthProvider>
		</ApolloProvider>
	);
}
