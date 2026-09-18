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

export const submitButtonBase = {
	backgroundColor: colors.primary,
	height: 48,
	borderRadius: 10,
	justifyContent: "center" as const,
	alignItems: "center" as const,
	marginBottom: 40,
};

export function edgeItemStyle(index: number, length: number) {
	return [
		index === 0 && commonStyles.menuItemFirst,
		index === length - 1 && commonStyles.menuItemLast,
	];
}

export const commonStyles = {
	container: { flex: 1, backgroundColor: colors.background, padding: 20 },

	menuContainer: {
		backgroundColor: colors.card,
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
	},
	menuItem: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	menuItemFirst: { marginTop: 0, paddingTop: 0 },
	menuItemLast: { borderBottomWidth: 0, paddingBottom: 0 },
	menuText: {
		fontSize: 15,
		fontWeight: "500" as const,
		color: colors.textPrimary,
		flex: 1,
	},
	card: {
		backgroundColor: colors.card,
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
		marginTop: 0,
		paddingTop: 0,
	},

	loadingContainer: {
		flex: 1,
		justifyContent: "center" as const,
		alignItems: "center" as const,
	},
	loadingCard: {
		flex: 1,
		justifyContent: "center" as const,
		alignItems: "center" as const,
	},
	cardText: {
		fontSize: 15,
		color: colors.textSecondary,
		paddingVertical: 14,
	},

	heading: { fontSize: 24, fontWeight: "bold" as const, marginBottom: 28 },
	sectionHeading: {
		fontSize: 12,
		fontWeight: "700" as const,
		color: colors.textSecondary,
		textTransform: "uppercase" as const,
		marginTop: 14,
		marginBottom: 6,
	},
	sectionHeadingFlat: { marginTop: 0, marginBottom: 0 },
	sectionHeaderRow: {
		flexDirection: "row" as const,
		justifyContent: "space-between" as const,
		alignItems: "center" as const,
		marginTop: 14,
		marginBottom: 6,
	},
	addText: { fontSize: 12, color: colors.primary },

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

	errorContainer: {
		flex: 1,
		justifyContent: "center" as const,
		alignItems: "center" as const,
		padding: 20,
	},
	errorText: { color: colors.danger, textAlign: "center" as const },
	errorCard: {
		flex: 1,
		justifyContent: "center" as const,
		alignItems: "center" as const,
		padding: 20,
	},

	changeText: { color: colors.primary, fontSize: 14 },

	searchInput: {
		fontSize: 15,
		color: colors.textPrimary,
		backgroundColor: colors.background,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		marginBottom: 12,
	},
	row: {
		...rowLayout,
		justifyContent: "space-between" as const,
		gap: 16,
		minHeight: 56,
	},
	listRow: {
		...rowLayout,
		gap: 10,
	},
	logRowTextContainer: { flex: 1 },
	logRowName: {
		fontSize: 13,
		fontWeight: "500" as const,
		color: colors.textPrimary,
	},
	logRowSubtitle: { fontSize: 11, color: colors.textSecondary },
	logRowValue: { fontSize: 12, color: colors.textSecondary },
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
	optionPillSelected: {
		borderColor: colors.primary,
		backgroundColor: colors.primary,
	},

	optionPillUnselected: {
		borderColor: "#ccc",
		backgroundColor: colors.card,
	},
	optionPillTextSelected: { color: colors.card },
	optionPillTextUnselected: { color: colors.textPrimary },

	iconBg: {
		width: 36,
		height: 36,
		borderRadius: 8,
		justifyContent: "center" as const,
		alignItems: "center" as const,
		marginRight: 12,
	},

	submitButton: submitButtonBase,
	submitButtonTight: { ...submitButtonBase, marginTop: 12 },
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

	deleteAction: {
		backgroundColor: colors.danger,
		justifyContent: "center" as const,
		alignItems: "center" as const,
		width: 64,
		borderRadius: 8,
	},
};
