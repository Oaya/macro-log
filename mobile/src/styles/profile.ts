import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { commonStyles } from "./common";

export const profileStyles = StyleSheet.create({
	avatarBlock: { alignItems: "center", marginTop: 20, marginBottom: 24 },
	avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
	name: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
	joined: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
	detailsCard: { ...commonStyles.card, marginBottom: 24 },
	optionGroup: {
		flexDirection: "row",
		gap: 4,
	},
	pillSelected: {
		borderColor: colors.primary,
		backgroundColor: colors.primary,
	},
	pillUnselected: {
		borderColor: "#ccc",
		backgroundColor: colors.card,
	},
	pillTextSelected: { color: colors.card },
	pillTextUnselected: { color: "#000" },
});
