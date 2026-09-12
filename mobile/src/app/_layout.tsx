import { ApolloProvider } from "@apollo/client/react";
import { Stack } from "expo-router";
import { client } from "./lib/apollo"; // import the client you created

export default function RootLayout() {
	return (
		<ApolloProvider client={client}>
			<Stack />
		</ApolloProvider>
	);
}
