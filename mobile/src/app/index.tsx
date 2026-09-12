import { gql, TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";

// Describe the shape of an exercise
type Exercise = {
	id: string;
	name: string;
};

type ExercisesData = {
	exercises: Exercise[];
};

const GET_EXERCISES: TypedDocumentNode<ExercisesData> = gql`
	query {
		exercises {
			id
			name
		}
	}
`;

export default function Index() {
	const { loading, error, data } = useQuery(GET_EXERCISES);

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
				<Text>Loading...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Error: {error.message}</Text>
			</View>
		);
	}

	return (
		<View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
			<Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
				MacroLog — Exercises
			</Text>
			<FlatList
				data={data?.exercises}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<Text style={{ fontSize: 18, paddingVertical: 8 }}>{item.name}</Text>
				)}
			/>
		</View>
	);
}
