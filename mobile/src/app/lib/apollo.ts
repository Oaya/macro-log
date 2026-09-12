import { ApolloClient, InMemoryCache } from "@apollo/client";
import { HttpLink } from "@apollo/client/link/http";

export const client = new ApolloClient({
	link: new HttpLink({ uri: process.env.EXPO_PUBLIC_API_URL }),
	cache: new InMemoryCache(),
});
