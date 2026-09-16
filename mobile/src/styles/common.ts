import { Platform } from "react-native";
import { colors } from "./colors";

// Plain objects (not StyleSheet.create) so they can be spread into a
// screen's own StyleSheet.create when a style needs a small local tweak.
export const rowLayout = {
	flexDirection: "row" as const,
	alignItems: "center" as const,
	paddingVertical: 14,
	borderBottomWidth: 1,
	borderBottomColor: colors.border,
};

export const boldText16 = {
	fontSize: 16,
	fontWeight: "600" as const,
};

export const commonStyles = {
	container: { flex: 1, backgroundColor: colors.background, padding: 20 },
	heading: { fontSize: 20, fontWeight: "bold" as const, marginBottom: 28 },
	sectionHeading: {
		fontSize: 12,
		fontWeight: "700" as const,
		color: colors.textSecondary,
		textTransform: "uppercase" as const,
		marginTop: 14,
		marginBottom: 6,
	},
	card: {
		backgroundColor: colors.card,
		borderRadius: 12,
		paddingHorizontal: 16,
	},
	menuContainer: {
		backgroundColor: colors.card,
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 16,
	},
	header: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		marginBottom: 20,
	},
	headerIcon: { marginRight: 8 },
	headerTitle: {
		fontSize: 18,
		fontWeight: "600" as const,
		flex: 1,
		marginRight: 4,
		color: colors.textPrimary,
	},
	changeText: { color: colors.primary, fontSize: 14 },
	cardText: {
		fontSize: 15,
		color: colors.textSecondary,
		paddingVertical: 14,
	},
	searchInput: {
		fontSize: 15,
		color: colors.textPrimary,
		backgroundColor: colors.background,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		marginTop: 16,
		marginBottom: 12,
	},
	row: {
		...rowLayout,
		justifyContent: "space-between" as const,
		gap: 16,
		minHeight: 56,
	},
	leftContainer: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
	},
	label: {
		fontSize: 15,
		color: colors.textPrimary,
		fontWeight: "500" as const,
	},
	value: {
		fontSize: 15,
		color: colors.textSecondary,
		flexShrink: 1,
		textAlign: "right" as const,
	},
	input: {
		fontSize: 15,
		color: colors.textPrimary,
		backgroundColor: colors.background,
		borderRadius: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		textAlign: "right" as const,
		flex: 0,
		width: 90,
		maxWidth: "65%" as const,
	},
	inputInlineWrapper: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		justifyContent: "flex-end" as const,
		flex: 1,
	},
	inputSuffix: { marginLeft: 6, fontSize: 14, color: colors.textSecondary },
	dropdownTrigger: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		gap: 6,
	},
	dropdownTriggerText: { fontSize: 15, color: colors.textPrimary },
	optionPill: { padding: 6, borderRadius: 8, borderWidth: 1 },
	iconBg: {
		width: 36,
		height: 36,
		borderRadius: 8,
		justifyContent: "center" as const,
		alignItems: "center" as const,
		marginRight: 12,
	},
	submitButton: {
		backgroundColor: colors.primary,
		height: 48,
		borderRadius: 10,
		justifyContent: "center" as const,
		alignItems: "center" as const,
		marginBottom: 40,
	},
	submitButtonText: { ...boldText16, color: colors.card },
	submitActionsContainer: {
		flexDirection: "row" as const,
		justifyContent: "space-between" as const,
		marginBottom: 40,
		gap: 12,
	},
	actionButton: {
		flex: 1,
		height: 48,
		borderRadius: 10,
		justifyContent: "center" as const,
		alignItems: "center" as const,
	},
	cancelButton: { backgroundColor: colors.cancel },
	cancelButtonText: { ...boldText16, color: colors.cancelText },
	saveButton: { backgroundColor: colors.success },
	saveButtonText: { ...boldText16, color: colors.card },
	modalBackdrop: {
		flex: 1,
		backgroundColor: colors.backdrop,
		justifyContent: "flex-end" as const,
	},
	modalSheet: {
		backgroundColor: colors.card,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "60%" as const,
		paddingBottom: Platform.OS === "ios" ? 24 : 12,
	},
	modalHeader: {
		...rowLayout,
		justifyContent: "space-between" as const,
		paddingHorizontal: 20,
	},
	modalTitle: { ...boldText16, color: colors.textPrimary },
	modalDoneText: { ...boldText16, color: colors.primary },
	modalOptionRow: {
		height: 44,
		justifyContent: "center" as const,
		paddingHorizontal: 20,
	},
	modalOptionText: { fontSize: 16, color: colors.textPrimary },
	modalOptionTextSelected: {
		color: colors.primary,
		fontWeight: "600" as const,
	},
};
