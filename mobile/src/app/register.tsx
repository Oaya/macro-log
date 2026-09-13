import { useAuth } from "@/lib/auth-context";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

type RegisterData = {
	register: { token: string; user: { email: string } };
};

type RegisterVariables = {
	email: string;
	password: string;
};

const REGISTER: TypedDocumentNode<RegisterData, RegisterVariables> = gql`
	mutation Register($email: String!, $password: String!) {
		register(email: $email, password: $password) {
			token
			user {
				email
			}
		}
	}
`;

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [register, { loading }] = useMutation(REGISTER);
	const router = useRouter();
	const { login: setLoggedIn } = useAuth();

	const handleRegister = async () => {
		try {
			const result = await register({ variables: { email, password } });
			const token = result.data?.register.token;

			if (token) {
				await setLoggedIn(token);
				router.replace("/");
			}
		} catch (e: any) {
			Alert.alert("Register failed", e.message);
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
				Create your account
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
				onPress={handleRegister}
				disabled={loading}
				style={{
					backgroundColor: "#000",
					padding: 16,
					borderRadius: 8,
					alignItems: "center",
				}}
			>
				<Text style={{ color: "#fff", fontWeight: "bold" }}>
					{loading ? "Creating..." : "Sign up"}
				</Text>
			</Pressable>
		</View>
	);
}
