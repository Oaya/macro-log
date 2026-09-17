import { commonStyles } from "@/styles/common";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Log() {
	const router = useRouter();

	return (
		<View style={commonStyles.container}>
			<Text style={commonStyles.heading}>What would you like to log?</Text>

			<View style={commonStyles.menuContainer}>
				<TouchableOpacity
					style={commonStyles.menuItem}
					onPress={() => router.push("/(tabs)/log/food")}
				>
					<View style={[commonStyles.iconBg, { backgroundColor: "#FFF3E0" }]}>
						<Ionicons
							name="restaurant"
							color="#FF9500"
							size={20}
						/>
					</View>
					<Text style={commonStyles.menuText}>Log Food</Text>
					<Ionicons
						name="chevron-forward"
						color="#C7C7CC"
						size={18}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={commonStyles.menuItem}
					onPress={() => router.push("/(tabs)/log/workout")}
				>
					<View style={[commonStyles.iconBg, { backgroundColor: "#E3F2FD" }]}>
						<Ionicons
							name="barbell"
							color="#007AFF"
							size={20}
						/>
					</View>
					<Text style={commonStyles.menuText}>Log Workout</Text>
					<Ionicons
						name="chevron-forward"
						color="#C7C7CC"
						size={18}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={[commonStyles.menuItem, styles.menuItemLast]}
					onPress={() => router.push("/(tabs)/log/weight")}
				>
					<View style={[commonStyles.iconBg, { backgroundColor: "#E8F5E9" }]}>
						<Ionicons
							name="scale"
							color="#34C759"
							size={20}
						/>
					</View>
					<Text style={commonStyles.menuText}>Record Weight</Text>
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
	menuItemLast: {
		borderBottomWidth: 0,
	},
});
