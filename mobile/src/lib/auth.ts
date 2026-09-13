import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

// For Login //
export async function saveToken(token: string) {
	await SecureStore.setItemAsync(TOKEN_KEY, token);
}

// Read for request //
export async function getToken(): Promise<string | null> {
	return await SecureStore.getItemAsync(TOKEN_KEY);
}

// For Logout //
export async function deleteToken() {
	await SecureStore.deleteItemAsync(TOKEN_KEY);
}
