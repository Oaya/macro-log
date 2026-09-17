import { AuthProvider, useAuth } from "@/lib/auth-context";
import { commonStyles } from "@/styles/common";
import { ApolloProvider } from "@apollo/client/react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ReactNode, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { client } from "../lib/apollo";

function LoadingScreen() {
	return (
		<View style={commonStyles.loadingContainer}>
			<ActivityIndicator size="large" />
		</View>
	);
}

function AuthGate({ children }: { children: ReactNode }) {
	const { checking, loggedIn } = useAuth();
	const router = useRouter();
	const segments = useSegments();
	const inAuthScreen = segments[0] === "login" || segments[0] === "register";

	useEffect(() => {
		if (checking) return;

		if (!loggedIn && !inAuthScreen) {
			router.replace("/login");
		} else if (loggedIn && inAuthScreen) {
			router.replace("/");
		}
	}, [checking, loggedIn, inAuthScreen, router]);

	if (checking) {
		return <LoadingScreen />;
	}

	// Redirect is in flight; hold off on rendering the mismatched screen.
	if ((!loggedIn && !inAuthScreen) || (loggedIn && inAuthScreen)) {
		return <LoadingScreen />;
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
