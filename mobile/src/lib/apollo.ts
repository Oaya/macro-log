import { ApolloClient, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
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

export const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
});
