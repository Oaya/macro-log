import { useAuth } from "@/lib/auth-context";
import { LOGIN } from "@/graphql/auth";
import { useMutation } from "@apollo/client/react";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [login, { loading }] = useMutation(LOGIN);
	const router = useRouter();
	const { login: setLoggedIn } = useAuth();

	const handleLogin = async () => {
		try {
			const result = await login({ variables: { email, password } });
			const token = result.data?.login.token;

			if (token) {
				await setLoggedIn(token);
				router.replace("/");
			}
		} catch (e: any) {
			Alert.alert("Login failed", e.message);
		}
	};

	return (
		<View
			style={{
				flex: 1,
				padding: 20,
				paddingTop: 80,
				gap: 12,
				backgroundColor: "#fff",
			}}
		>
			<Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
				Log in to MacroLog
			</Text>
			<TextInput
				placeholder="Email"
				placeholderTextColor="#888"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				style={{
					borderWidth: 1,
					borderColor: "#ccc",
					padding: 12,
					borderRadius: 8,
					color: "#000",
				}}
			/>
			<TextInput
				placeholder="Password"
				placeholderTextColor="#888"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				style={{
					borderWidth: 1,
					borderColor: "#ccc",
					padding: 12,
					borderRadius: 8,
					color: "#000",
				}}
			/>
			<Pressable
				onPress={handleLogin}
				disabled={loading}
				style={{
					backgroundColor: "#000",
					padding: 16,
					borderRadius: 8,
					alignItems: "center",
				}}
			>
				<Text style={{ color: "#fff", fontWeight: "bold" }}>
					{loading ? "Logging in..." : "Log in"}
				</Text>
			</Pressable>

			<Link
				href="/register"
				style={{ marginTop: 16, textAlign: "center", color: "blue" }}
			>
				Don&apos;t have an account? Sign up
			</Link>
		</View>
	);
}
