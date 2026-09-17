import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { HttpLink } from "@apollo/client/link/http";
import { getToken } from "./auth";

const httpLink = new HttpLink({ uri: process.env.EXPO_PUBLIC_API_URL });

//Attach the token to every request's Authorization header
const authLink = new SetContextLink(async (prevContext) => {
	const token = await getToken();

	return {
		headers: {
			...prevContext.headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	};
});

// AuthProvider registers a handler here so a stale/expired token logs the
// user out immediately instead of leaving them stuck on a protected screen.
let onAuthError: (() => void) | null = null;
export function setOnAuthError(handler: () => void) {
	onAuthError = handler;
}

const errorLink = new ErrorLink(({ error }) => {
	if (
		CombinedGraphQLErrors.is(error) &&
		error.errors.some((e) => e.message === "Not authenticated")
	) {
		onAuthError?.();
	}
});

export const client = new ApolloClient({
	link: errorLink.concat(authLink).concat(httpLink),
	cache: new InMemoryCache(),
});
