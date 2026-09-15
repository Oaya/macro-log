import { TypedDocumentNode, gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

const ACTIVITY_LEVEL = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE"];

type WeightOption = { label: string; kg: number };

// Height is always stored/sent as centimeters; only the dropdown's display differs by unit.
const KG_MIN = 20;
const KG_MAX = 250;
const DEFAULT_KG = 70;

const parseWeightKg = (value: string | null) => {
	const parsed = value ? parseFloat(value) : NaN;
	if (isNaN(parsed)) return DEFAULT_KG;
	return Math.min(Math.max(Math.round(parsed), KG_MIN), KG_MAX);
};

const METRIC_WEIGHT_OPTIONS: WeightOption[] = Array.from(
	{ length: KG_MAX - KG_MIN + 1 },
	(_, i) => {
		const kg = KG_MIN + i;
		return { label: `${kg} kg`, kg };
	},
);

const LB_MIN = Math.round(KG_MIN * 2.20462); // ~44 lb
const LB_MAX = Math.round(KG_MAX * 2.20462); // ~551 lb

const IMPERIAL_WEIGHT_OPTIONS: WeightOption[] = Array.from(
	{ length: (LB_MAX - LB_MIN + 1) * 16 },
	(_, i) => {
		const totalOunces = i + LB_MIN * 16;
		const lb = Math.floor(totalOunces / 16);
		const oz = totalOunces % 16;
		return {
			label: `${lb} lb ${oz} oz`,
			kg: Math.round((totalOunces / 16 / 2.20462) * 10) / 10,
		};
	},
);

const findNearestOptionIndex = (options: WeightOption[], kg: number) => {
	let nearestIndex = 0;
	let smallestDiff = Infinity;
	options.forEach((option, index) => {
		const diff = Math.abs(option.kg - kg);
		if (diff < smallestDiff) {
			smallestDiff = diff;
			nearestIndex = index;
		}
	});
	return nearestIndex;
};

type GoalData = {
	goal: {
		id: string;
		dailyCalories: number;
		proteinG: number;
		fatG: number;
		carbsG: number;
		startWeightKg: number | null;
		targetWeightKg: number | null;
		targetDate: string | null;
		activityLevel: string;
	} | null;
	me: {
		unitPreference: string;
	};
};

const GOAL: TypedDocumentNode<GoalData> = gql`
	query GetGoal {
		goal {
			dailyCalories
			proteinG
			fatG
			carbsG
			startWeightKg
			targetWeightKg
			targetDate
			activityLevel
		}
		me {
			unitPreference
		}
	}
`;

const SET_WEIGHT_GOAL = gql`
	mutation SetWeightGoal(
		$startWeightKg: Float!
		$targetWeightKg: Float!
		$targetDate: Date!
		$activityLevel: String!
	) {
		setWeightGoal(
			startWeightKg: $startWeightKg
			targetWeightKg: $targetWeightKg
			targetDate: $targetDate
			activityLevel: $activityLevel
		) {
			startWeightKg
			targetWeightKg
			targetDate
			activityLevel
		}
	}
`;

export default function SetGoal() {
	const { data: goalData, loading, error } = useQuery(GOAL);
	const [setGoal, { loading: updating, data }] =
		useMutation<GoalData>(SET_WEIGHT_GOAL);

	// Local State Management for Editing
	const [isEditing, setIsEditing] = useState(false);
	const [startWeight, setStartWeight] = useState<string | null>("");
	const [targetWeight, setTargetWeight] = useState<string | null>("");
	const [targetDate, setTargetDate] = useState<string | null>(""); // "YYYY-MM-DD"
	const [activity, setActivity] = useState<string>("MODERATE");
	const [weightPickerVisible, setWeightPickerVisible] = useState(false);
	const unit = goalData?.me.unitPreference;

	// Initialize local state when Apollo data loads
	useEffect(() => {
		if (goalData?.goal) {
			setStartWeight(goalData.goal.startWeightKg?.toString() ?? "");
			setTargetWeight(goalData.goal.targetWeightKg?.toString() ?? "");
			setTargetDate(goalData.goal.targetDate);
			setActivity(goalData.goal.activityLevel);
		}
	}, [goalData]);

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 8 }}>Loading...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					padding: 20,
				}}
			>
				<Text style={{ color: "#FF3B30", textAlign: "center" }}>
					Error: {error.message}
				</Text>
			</View>
		);
	}

	//  Save and Cancel Handlers
	const handleSave = async () => {
		try {
			await setGoal({
				variables: {
					targetDate: targetDate,
					startWeightKg: parseFloat(startWeight ?? ""),
					targetWeightKg: parseFloat(targetWeight ?? ""),
					activityLevel: activity,
				},
			});
			setIsEditing(false);
			Alert.alert("Success", "Goal updated successfully!");
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to update goal.");
		}
	};

	const handleCancel = () => {
		if (goalData?.goal) {
			setStartWeight(goalData.goal.startWeightKg?.toString() ?? "");
			setTargetWeight(goalData.goal.targetWeightKg?.toString() ?? "");
			setTargetDate(goalData.goal.targetDate);
			setActivity(goalData.goal.activityLevel);
		}
		setIsEditing(false);
	};

	const formatWeightDisplay = (weightVal: string) => {
		const kg = parseFloat(weightVal);
		if (isNaN(kg) || kg <= 0) return "--";

		if (unit?.toLowerCase() === "imperial") {
			const totalOunces = Math.round(kg * 2.20462 * 16);
			const lb = Math.floor(totalOunces / 16);
			const oz = totalOunces % 16;
			return `${lb} lb ${oz} oz`;
		}
		return `${kg} kg`;
	};

	const weightOptions =
		unit?.toUpperCase() === "IMPERIAL"
			? IMPERIAL_WEIGHT_OPTIONS
			: METRIC_WEIGHT_OPTIONS;
	const selectedHeightIndex = findNearestOptionIndex(
		weightOptions,
		parseWeightKg(targetWeight),
	);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
		>
			<ScrollView
				style={styles.container}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.detailsCard}>
					{/* Target Weight Row */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Current Weight</Text>
						</View>
						{isEditing ? (
							<Pressable
								style={styles.dropdownTrigger}
								onPress={() => setWeightPickerVisible(true)}
							>
								<Text style={styles.dropdownTriggerText}>
									{weightOptions[selectedHeightIndex]?.label ?? "--"}
								</Text>
								<Text style={styles.dropdownChevron}>⌄</Text>
							</Pressable>
						) : (
							<Text
								style={styles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{formatWeightDisplay(startWeight ?? "")}
							</Text>
						)}
					</View>

					{/* Target Weight Row */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Target Weight</Text>
						</View>
						{isEditing ? (
							<Pressable
								style={styles.dropdownTrigger}
								onPress={() => setWeightPickerVisible(true)}
							>
								<Text style={styles.dropdownTriggerText}>
									{weightOptions[selectedHeightIndex]?.label ?? "--"}
								</Text>
								<Text style={styles.dropdownChevron}>⌄</Text>
							</Pressable>
						) : (
							<Text
								style={styles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{formatWeightDisplay(targetWeight ?? "")}
							</Text>
						)}
					</View>

					{/* Target date Row */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Target Date</Text>
						</View>
						{isEditing ? (
							<TextInput
								style={styles.input}
								value={targetDate ?? ""}
								placeholder="YYYY-MM-DD"
								placeholderTextColor="#C7C7CC"
								onChangeText={(text) => setTargetDate(text)}
							/>
						) : (
							<Text
								style={styles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{goalData?.goal?.targetDate || "--"}
							</Text>
						)}
					</View>

					{/* Activity Level Row */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Activity Level</Text>
						</View>
						{isEditing ? (
							<View style={styles.optionGroup}>
								{ACTIVITY_LEVEL.map((option) => (
									<Pressable
										key={option}
										onPress={() => setActivity(option)}
										style={[
											styles.optionPill,
											{
												borderColor: activity === option ? "#4bb7e1" : "#ccc",
												backgroundColor:
													activity === option ? "#4bb7e1" : "#fff",
											},
										]}
									>
										<Text
											style={{
												color: activity === option ? "#fff" : "#000",
											}}
										>
											{option}
										</Text>
									</Pressable>
								))}
							</View>
						) : (
							<Text
								style={styles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{goalData?.goal?.activityLevel || "--"}
							</Text>
						)}
					</View>
				</View>

				{/*  Dynamic Footer Action Layout */}
				{isEditing ? (
					<View style={styles.editActionsContainer}>
						<TouchableOpacity
							style={[styles.actionButton, styles.cancelButton]}
							onPress={handleCancel}
						>
							<Text style={styles.cancelButtonText}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.actionButton, styles.saveButton]}
							onPress={handleSave}
							disabled={updating}
						>
							{updating ? (
								<ActivityIndicator
									color="#FFF"
									size="small"
								/>
							) : (
								<Text style={styles.saveButtonText}>Save</Text>
							)}
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						style={styles.editButton}
						onPress={() => setIsEditing(true)}
					>
						<Text style={styles.editButtonText}>Edit Goal</Text>
					</TouchableOpacity>
				)}
			</ScrollView>

			<Modal
				visible={weightPickerVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setWeightPickerVisible(false)}
			>
				<Pressable
					style={styles.modalBackdrop}
					onPress={() => setWeightPickerVisible(false)}
				>
					<Pressable
						style={styles.modalSheet}
						onPress={() => {}}
					>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Select Height</Text>
							<TouchableOpacity onPress={() => setWeightPickerVisible(false)}>
								<Text style={styles.modalDoneText}>Done</Text>
							</TouchableOpacity>
						</View>
						<FlatList
							data={weightOptions}
							keyExtractor={(item) => item.label}
							initialScrollIndex={selectedHeightIndex}
							getItemLayout={(_, index) => ({
								length: 44,
								offset: 44 * index,
								index,
							})}
							renderItem={({ item, index }) => (
								<TouchableOpacity
									style={styles.modalOptionRow}
									onPress={() => {
										setTargetWeight(String(item.kg));
										setWeightPickerVisible(false);
									}}
								>
									<Text
										style={[
											styles.modalOptionText,
											index === selectedHeightIndex &&
												styles.modalOptionTextSelected,
										]}
									>
										{item.label}
									</Text>
								</TouchableOpacity>
							)}
						/>
					</Pressable>
				</Pressable>
			</Modal>
		</KeyboardAvoidingView>
	);
}

const rowLayout = {
	flexDirection: "row" as const,
	alignItems: "center" as const,
	justifyContent: "space-between" as const,
	paddingVertical: 14,
	borderBottomWidth: 1,
	borderBottomColor: "#F2F2F7",
};

const boldText16 = { fontSize: 16, fontWeight: "600" as const };

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F4F6F9", padding: 20 },
	avatarBlock: { alignItems: "center", marginTop: 20, marginBottom: 24 },
	avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
	name: { fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
	joined: { fontSize: 13, color: "#8E8E93", marginTop: 4 },
	detailsCard: {
		backgroundColor: "#FFF",
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 24,
	},
	row: {
		...rowLayout,
		gap: 16,
		minHeight: 56,
	},
	dropdownTrigger: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	dropdownTriggerText: {
		fontSize: 15,
		color: "#1A1A1A",
	},
	dropdownChevron: {
		fontSize: 15,
		color: "#8E8E93",
	},

	leftContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	optionGroup: {
		flexDirection: "row",
		gap: 4,
	},
	optionPill: {
		padding: 6,
		borderRadius: 8,
		borderWidth: 1,
	},
	label: {
		fontSize: 15,
		color: "#1A1A1A",
		fontWeight: "500",
	},
	value: {
		fontSize: 15,
		color: "#8E8E93",
		flexShrink: 1,
		textAlign: "right",
	},
	input: {
		fontSize: 15,
		color: "#1A1A1A",
		backgroundColor: "#F4F6F9",
		borderRadius: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		textAlign: "right",
		flex: 1,
		maxWidth: "65%",
	},
	inputInlineWrapper: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		flex: 1,
	},
	inputSuffix: {
		marginLeft: 6,
		fontSize: 14,
		color: "#8E8E93",
	},

	editButton: {
		backgroundColor: "#4bb7e1",
		height: 48,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 40,
	},
	editButtonText: { ...boldText16, color: "#FFF" },
	editActionsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 40,
		gap: 12,
	},
	actionButton: {
		flex: 1,
		height: 48,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	cancelButton: { backgroundColor: "#E5E5EA" },
	cancelButtonText: { ...boldText16, color: "#48484A" },
	saveButton: { backgroundColor: "#8bf3a5" },
	saveButtonText: { ...boldText16, color: "#FFF" },

	modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "flex-end",
	},
	modalSheet: {
		backgroundColor: "#FFF",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "60%",
		paddingBottom: Platform.OS === "ios" ? 24 : 12,
	},
	modalHeader: {
		...rowLayout,
		paddingHorizontal: 20,
	},
	modalTitle: { ...boldText16, color: "#1A1A1A" },
	modalDoneText: { ...boldText16, color: "#4bb7e1" },
	modalOptionRow: {
		height: 44,
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	modalOptionText: {
		fontSize: 16,
		color: "#1A1A1A",
	},
	modalOptionTextSelected: {
		color: "#4bb7e1",
		fontWeight: "600",
	},
});
