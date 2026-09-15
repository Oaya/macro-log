import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Log() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>What would you like to log?</Text>

			<View style={styles.menuContainer}>
				<TouchableOpacity
					style={styles.menuItem}
					// onPress={() => router.push("/(tabs)/log/food")}
				>
					<View style={[styles.iconBg, { backgroundColor: "#FFF3E0" }]}>
						<Ionicons
							name="restaurant"
							color="#FF9500"
							size={20}
						/>
					</View>
					<Text style={styles.menuText}>Log Food</Text>
					<Ionicons
						name="chevron-forward"
						color="#C7C7CC"
						size={18}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.menuItem}
					// onPress={() => router.push("/(tabs)/log/workout")}
				>
					<View style={[styles.iconBg, { backgroundColor: "#E3F2FD" }]}>
						<Ionicons
							name="barbell"
							color="#007AFF"
							size={20}
						/>
					</View>
					<Text style={styles.menuText}>Log Workout</Text>
					<Ionicons
						name="chevron-forward"
						color="#C7C7CC"
						size={18}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.menuItem, styles.menuItemLast]}
					onPress={() => router.push("/(tabs)/log/weight")}
				>
					<View style={[styles.iconBg, { backgroundColor: "#E8F5E9" }]}>
						<Ionicons
							name="scale"
							color="#34C759"
							size={20}
						/>
					</View>
					<Text style={styles.menuText}>Record Weight</Text>
					<Ionicons
						name="chevron-forward"
						color="#C7C7CC"
						size={18}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, paddingTop: 20 },
	heading: { fontSize: 20, padding: 20, fontWeight: "bold", marginBottom: 20 },
	menuContainer: {
		backgroundColor: "#FFF",
		borderRadius: 12,
		marginHorizontal: 16,
		paddingVertical: 6,
		marginBottom: 30,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#F2F2F7",
	},
	menuItemLast: {
		borderBottomWidth: 0,
	},
	iconBg: {
		width: 36,
		height: 36,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	menuText: { flex: 1, fontSize: 16 },
});
