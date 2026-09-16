import { useAuth } from "@/lib/auth-context";
import { authStyles } from "@/styles/auth";
import { REGISTER } from "@/graphql/auth";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [register, { loading }] = useMutation(REGISTER);
	const router = useRouter();
	const { login: setLoggedIn } = useAuth();

	const handleRegister = async () => {
		try {
			const result = await register({
				variables: { email, password, username },
			});
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
		<View style={authStyles.container}>
			<Text style={authStyles.title}>Create your account</Text>
			<TextInput
				placeholder="Email"
				placeholderTextColor="#888"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				style={authStyles.input}
			/>
			<TextInput
				placeholder="Username"
				placeholderTextColor="#888"
				value={username}
				onChangeText={setUsername}
				autoCapitalize="none"
				style={authStyles.input}
			/>
			<TextInput
				placeholder="Password"
				placeholderTextColor="#888"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				style={authStyles.input}
			/>
			<Pressable
				onPress={handleRegister}
				disabled={loading}
				style={authStyles.button}
			>
				<Text style={authStyles.buttonText}>
					{loading ? "Creating..." : "Sign up"}
				</Text>
			</Pressable>
		</View>
	);
}
