import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		paddingTop: 80,
		gap: 12,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 12,
		borderRadius: 8,
		color: "#000",
	},
	button: {
		backgroundColor: "#000",
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	link: {
		marginTop: 16,
		textAlign: "center",
		color: "blue",
	},
});
