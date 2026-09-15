import { DatePickerModal } from "@/components/date-picker-modal";
import { TypedDocumentNode, gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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
		id: string;
		unitPreference: string;
	};
};

type SetWeightGoalData = {
	setWeightGoal: {
		startWeightKg: number;
		targetWeightKg: number;
		targetDate: string;
		activityLevel: string;
	};
};

type SetWeightGoalVariables = {
	startWeightKg: number;
	targetWeightKg: number;
	targetDate: string;
	activityLevel: string;
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
			id
			unitPreference
		}
	}
`;

const SET_WEIGHT_GOAL: TypedDocumentNode<
	SetWeightGoalData,
	SetWeightGoalVariables
> = gql`
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

	const [setGoal, { loading: updating }] = useMutation(SET_WEIGHT_GOAL);

	const [isEditing, setIsEditing] = useState(false);
	const [activityPickerVisible, setActivityPickerVisible] = useState(false);
	const [targetDatePickerVisible, setTargetDatePickerVisible] = useState(false);

	// These values are stored in the user's DISPLAY unit.
	// Imperial user -> pounds
	// Metric user -> kilograms
	const [startWeight, setStartWeight] = useState("");
	const [targetWeight, setTargetWeight] = useState("");
	const [targetDate, setTargetDate] = useState("");
	const [activity, setActivity] = useState("MODERATE");
	const [initializedGoalKey, setInitializedGoalKey] = useState<string | null>(
		null,
	);

	const unit = goalData?.me.unitPreference;

	const isImperial = unit?.toUpperCase() === "IMPERIAL";

	//Backend always stores kg. Convert backend kg into whatever unit the user should see.
	const kgToDisplayWeight = (kg: number | null) => {
		if (kg == null) {
			return "";
		}

		if (isImperial) {
			const pounds = kg * 2.20462;
			return pounds.toFixed(1);
		}

		return kg.toString();
	};

	// Convert what the user typed back into kg before sending it to the backend.
	const displayWeightToKg = (value: string) => {
		const weight = parseFloat(value);

		if (isNaN(weight) || weight <= 0) {
			return null;
		}

		if (isImperial) {
			return Number((weight / 2.20462).toFixed(2));
		}

		return Number(weight.toFixed(2));
	};

	///Initialize local state from backend data.
	//The backend gives us kg, but our input fields should/show lb when the user's preference is imperial.
	const goalKey = goalData ? `${goalData.goal?.id ?? "none"}:${unit}` : null;

	if (goalKey && goalKey !== initializedGoalKey) {
		setInitializedGoalKey(goalKey);
		if (goalData?.goal) {
			setStartWeight(kgToDisplayWeight(goalData.goal.startWeightKg));
			setTargetWeight(kgToDisplayWeight(goalData.goal.targetWeightKg));
			setTargetDate(goalData.goal.targetDate ?? "");
			setActivity(goalData.goal.activityLevel);
		}
	}

	if (loading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
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
				<Text
					style={{
						color: "#FF3B30",
						textAlign: "center",
					}}
				>
					Error: {error.message}
				</Text>
			</View>
		);
	}

	const handleSave = async () => {
		const startWeightKg = displayWeightToKg(startWeight);
		const targetWeightKg = displayWeightToKg(targetWeight);

		if (startWeightKg === null) {
			Alert.alert("Invalid Weight", "Please enter a valid current weight.");
			return;
		}

		if (targetWeightKg === null) {
			Alert.alert("Invalid Weight", "Please enter a valid target weight.");
			return;
		}

		if (!targetDate) {
			Alert.alert("Invalid Date", "Please enter a target date.");
			return;
		}

		try {
			await setGoal({
				variables: {
					targetDate,
					startWeightKg,
					targetWeightKg,
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
			setStartWeight(kgToDisplayWeight(goalData.goal.startWeightKg));

			setTargetWeight(kgToDisplayWeight(goalData.goal.targetWeightKg));

			setTargetDate(goalData.goal.targetDate ?? "");
			setActivity(goalData.goal.activityLevel);
		}
		setIsEditing(false);
	};

	const formatWeightDisplay = (weightVal: string) => {
		const weight = parseFloat(weightVal);

		if (isNaN(weight) || weight <= 0) {
			return "--";
		}

		return isImperial ? `${weight} lb` : `${weight} kg`;
	};

	// Parse/format as local calendar dates (not UTC) so the picker's day
	// doesn't shift when the local timezone is ahead of or behind UTC.
	const parseTargetDate = (value: string): Date => {
		const [year, month, day] = value.split("-").map(Number);
		if (!year || !month || !day) {
			return new Date();
		}
		return new Date(year, month - 1, day);
	};

	const formatDateToISO = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const selectedActivityIndex = ACTIVITY_LEVEL.indexOf(activity);

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
					<Text style={styles.sectionHeading}>Goal</Text>
					{/* Current Weight */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Current Weight</Text>
						</View>

						{isEditing ? (
							<View style={styles.inputInlineWrapper}>
								<TextInput
									style={[
										styles.input,
										{
											flex: 0,
											width: 90,
										},
									]}
									value={startWeight}
									keyboardType="decimal-pad"
									placeholder={isImperial ? "130.0" : "60.0"}
									placeholderTextColor="#C7C7CC"
									onChangeText={setStartWeight}
								/>

								<Text style={styles.inputSuffix}>
									{isImperial ? "lb" : "kg"}
								</Text>
							</View>
						) : (
							<Text style={styles.value}>
								{formatWeightDisplay(startWeight)}
							</Text>
						)}
					</View>

					{/* Target Weight */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Target Weight</Text>
						</View>

						{isEditing ? (
							<View style={styles.inputInlineWrapper}>
								<TextInput
									style={[
										styles.input,
										{
											flex: 0,
											width: 90,
										},
									]}
									value={targetWeight}
									keyboardType="decimal-pad"
									placeholder={isImperial ? "120.0" : "55.0"}
									placeholderTextColor="#C7C7CC"
									onChangeText={setTargetWeight}
								/>

								<Text style={styles.inputSuffix}>
									{isImperial ? "lb" : "kg"}
								</Text>
							</View>
						) : (
							<Text style={styles.value}>
								{formatWeightDisplay(targetWeight)}
							</Text>
						)}
					</View>

					{/* Target Date */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Target Date</Text>
						</View>

						{isEditing ? (
							<Pressable
								style={styles.dropdownTrigger}
								onPress={() => setTargetDatePickerVisible(true)}
							>
								<Text style={styles.dropdownTriggerText}>
									{targetDate || "--"}
								</Text>
								<Ionicons
									name="chevron-down"
									size={14}
									color="#8E8E93"
								/>
							</Pressable>
						) : (
							<Text
								style={styles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{targetDate || "--"}
							</Text>
						)}
					</View>

					{/* Activity Level */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Activity Level</Text>
						</View>

						{isEditing ? (
							<Pressable
								style={styles.dropdownTrigger}
								onPress={() => setActivityPickerVisible(true)}
							>
								<Text style={styles.dropdownTriggerText}>
									{activity || "--"}
								</Text>
								<Ionicons
									name="chevron-down"
									size={14}
									color="#8E8E93"
								/>
							</Pressable>
						) : (
							<Text
								style={styles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{activity || "--"}
							</Text>
						)}
					</View>
				</View>

				{/* Daily Target */}
				{goalData?.goal && (
					<View style={styles.detailsCard}>
						<Text style={styles.sectionHeading}>Daily Goal</Text>
						<View style={styles.row}>
							<Text style={styles.label}>Daily Calories</Text>
							<Text style={styles.value}>
								{goalData.goal.dailyCalories} cal
							</Text>
						</View>

						<View style={styles.row}>
							<Text style={styles.label}>Carbs</Text>
							<Text style={styles.value}>{goalData.goal.carbsG} g</Text>
						</View>

						<View style={styles.row}>
							<Text style={styles.label}>Protein</Text>
							<Text style={styles.value}>{goalData.goal.proteinG} g</Text>
						</View>

						<View style={styles.row}>
							<Text style={styles.label}>Fat</Text>
							<Text style={styles.value}>{goalData.goal.fatG} g</Text>
						</View>
					</View>
				)}

				{/* Actions */}
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
				visible={activityPickerVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setActivityPickerVisible(false)}
			>
				<Pressable
					style={styles.modalBackdrop}
					onPress={() => setActivityPickerVisible(false)}
				>
					<Pressable
						style={styles.modalSheet}
						onPress={() => {}}
					>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Select Activity Level</Text>
							<TouchableOpacity onPress={() => setActivityPickerVisible(false)}>
								<Text style={styles.modalDoneText}>Done</Text>
							</TouchableOpacity>
						</View>
						<FlatList
							data={ACTIVITY_LEVEL}
							keyExtractor={(item) => item}
							initialScrollIndex={selectedActivityIndex}
							getItemLayout={(_, index) => ({
								length: 44,
								offset: 44 * index,
								index,
							})}
							renderItem={({ item, index }) => (
								<TouchableOpacity
									style={styles.modalOptionRow}
									onPress={() => {
										setActivity(item);
										setActivityPickerVisible(false);
									}}
								>
									<Text
										style={[
											styles.modalOptionText,
											index === selectedActivityIndex &&
												styles.modalOptionTextSelected,
										]}
									>
										{item}
									</Text>
								</TouchableOpacity>
							)}
						/>
					</Pressable>
				</Pressable>
			</Modal>

			<DatePickerModal
				visible={targetDatePickerVisible}
				title="Select Target Date"
				value={parseTargetDate(targetDate)}
				onChange={(date) => setTargetDate(formatDateToISO(date))}
				onClose={() => setTargetDatePickerVisible(false)}
			/>
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

const boldText16 = {
	fontSize: 16,
	fontWeight: "600" as const,
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F4F6F9",
		padding: 20,
	},

	detailsCard: {
		backgroundColor: "#FFF",
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 24,
	},

	sectionHeading: {
		fontSize: 12,
		fontWeight: "700",
		color: "#8E8E93",
		textTransform: "uppercase",

		marginTop: 14,
		marginBottom: 6,
	},

	row: {
		...rowLayout,
		gap: 16,
		minHeight: 56,
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

	dropdownTrigger: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},

	dropdownTriggerText: {
		fontSize: 15,
		color: "#1A1A1A",
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

	editButtonText: {
		...boldText16,
		color: "#FFF",
	},

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

	cancelButton: {
		backgroundColor: "#E5E5EA",
	},

	cancelButtonText: {
		...boldText16,
		color: "#48484A",
	},

	saveButton: {
		backgroundColor: "#8bf3a5",
	},

	saveButtonText: {
		...boldText16,
		color: "#FFF",
	},

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

	modalTitle: {
		...boldText16,
		color: "#1A1A1A",
	},

	modalDoneText: {
		...boldText16,
		color: "#4bb7e1",
	},

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
