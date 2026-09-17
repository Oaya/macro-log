import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { client, setOnAuthError } from "./apollo";
import { deleteToken, getToken, saveToken } from "./auth";

type AuthContextValue = {
	checking: boolean;
	loggedIn: boolean;
	login: (token: string) => Promise<void>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [checking, setChecking] = useState(true);
	const [loggedIn, setLoggedIn] = useState(false);

	useEffect(() => {
		getToken().then((token) => {
			setLoggedIn(!!token);
			setChecking(false);
		});
	}, []);

	const login = async (token: string) => {
		await saveToken(token);
		// Refetch any active queries (e.g. `me`) so they run with the new token.
		await client.resetStore();
		setLoggedIn(true);
	};

	const logout = async () => {
		await deleteToken();
		await client.clearStore();
		setLoggedIn(false);
	};

	// The token can go stale (expired/revoked) without us touching it locally,
	// so let the Apollo error link force a logout as soon as the backend says so.
	useEffect(() => {
		setOnAuthError(() => {
			logout();
		});
	}, []);

	return (
		<AuthContext.Provider value={{ checking, loggedIn, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return ctx;
}
