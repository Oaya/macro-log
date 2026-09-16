import { useAuth } from "@/lib/auth-context";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type MeData = {
	me: { id: string; email: string; username: string };
};

const ME: TypedDocumentNode<MeData> = gql`
	query {
		me {
			id
			email
			username
		}
	}
`;

export default function More() {
	const { data: meData, loading, error } = useQuery(ME);
	const router = useRouter();
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		router.replace("/login");
	};

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
		<ScrollView
			style={styles.container}
			showsVerticalScrollIndicator={false}
		>
			{/*  Profile Row */}
			<TouchableOpacity
				style={styles.profileCard}
				onPress={() => router.push("/(tabs)/more/profile")}
				activeOpacity={0.7}
			>
				<Image
					source={{
						uri: "https://plus.unsplash.com/premium_photo-1739786996040-32bde1db0610?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
					}}
					style={styles.avatar}
				/>
				<View style={styles.profileMeta}>
					<Text style={styles.profileName}>{meData?.me.username}</Text>
					<Text style={styles.profileEmail}>{meData?.me.email}</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					color={colors.placeholder}
					size={20}
				/>
			</TouchableOpacity>

			{/*  Menu Options List */}
			<View style={styles.menuContainer}>
				<Text style={styles.sectionHeading}>Nutrition & Goals</Text>

				<TouchableOpacity
					style={styles.menuItem}
					onPress={() => router.push("/(tabs)/more/set-goal")}
				>
					<View style={[styles.iconBg, { backgroundColor: "#E3F2FD" }]}>
						<Ionicons
							name="nutrition"
							color="#007AFF"
							size={20}
						/>
					</View>
					<Text style={styles.menuText}>Calorie & Goals</Text>
					<Ionicons
						name="chevron-forward"
						color={colors.placeholder}
						size={18}
					/>
				</TouchableOpacity>

				{/* <TouchableOpacity style={styles.menuItem}>
					<View style={[styles.iconBg, { backgroundColor: "#E8F5E9" }]}>
						<Ionicons
							name="trophy"
							color="#34C759"
							size={20}
						/>
					</View>
					<Text style={styles.menuText}>Weight Goals</Text>
					<Ionicons
						name="chevron-forward"
						color={colors.placeholder}
						size={18}
					/>
				</TouchableOpacity> */}

				{/* Logout */}
				<TouchableOpacity
					style={[styles.menuItem, styles.logoutItem]}
					onPress={handleLogout}
				>
					<View style={[styles.iconBg, { backgroundColor: "#FFEBEE" }]}>
						<Ionicons
							name="log-out"
							color={colors.danger}
							size={20}
						/>
					</View>
					<Text
						style={[
							styles.menuText,
							{ color: colors.danger, fontWeight: "600" },
						]}
					>
						Log Out
					</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	profileCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.card,
		marginTop: 16,
		marginHorizontal: 16,
		padding: 16,
		borderRadius: 12,
	},
	avatar: { width: 50, height: 50, borderRadius: 25 },
	profileMeta: { marginLeft: 14, flex: 1 },
	profileName: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
	profileEmail: {
		fontSize: 13,
		color: "#007AFF",
		fontWeight: "500",
		marginTop: 2,
	},

	menuContainer: {
		backgroundColor: colors.card,
		borderRadius: 12,
		marginHorizontal: 16,
		marginTop: 16,
		paddingVertical: 6,
		marginBottom: 30,
	},
	sectionHeading: { ...commonStyles.sectionHeading, marginLeft: 16 },
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	logoutItem: { borderBottomWidth: 0, marginTop: 10 },
	iconBg: {
		width: 34,
		height: 34,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	menuText: {
		fontSize: 15,
		fontWeight: "500",
		color: colors.textPrimary,
		flex: 1,
	},
});
