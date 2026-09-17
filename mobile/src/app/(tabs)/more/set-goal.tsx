import { DatePickerModal } from "@/components/date-picker-modal";
import { GOAL, SET_WEIGHT_GOAL } from "@/graphql/goal";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { displayWeightToKg, kgToDisplayWeight } from "@/lib/units";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
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

export function getNavOptions() {
	return { title: "" };
}

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

	///Initialize local state from backend data.
	//The backend gives us kg, but our input fields should/show lb when the user's preference is imperial.
	const goalKey = goalData ? `${goalData.goal?.id ?? "none"}:${unit}` : null;

	if (goalKey && goalKey !== initializedGoalKey) {
		setInitializedGoalKey(goalKey);
		if (goalData?.goal) {
			setStartWeight(
				kgToDisplayWeight(goalData.goal.startWeightKg, isImperial),
			);
			setTargetWeight(
				kgToDisplayWeight(goalData.goal.targetWeightKg, isImperial),
			);
			setTargetDate(goalData.goal.targetDate ?? "");
			setActivity(goalData.goal.activityLevel);
		}
	}

	if (loading) {
		return (
			<View style={commonStyles.loadingContainer}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 8 }}>Loading...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={commonStyles.errorContainer}>
				<Text style={commonStyles.errorText}>Error: {error.message}</Text>
			</View>
		);
	}

	const handleSave = async () => {
		const startWeightKg = displayWeightToKg(startWeight, isImperial);
		const targetWeightKg = displayWeightToKg(targetWeight, isImperial);

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
			setStartWeight(
				kgToDisplayWeight(goalData.goal.startWeightKg, isImperial),
			);

			setTargetWeight(
				kgToDisplayWeight(goalData.goal.targetWeightKg, isImperial),
			);

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

	const selectedActivityIndex = ACTIVITY_LEVEL.indexOf(activity);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
		>
			<ScrollView
				style={commonStyles.container}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.detailsCard}>
					<Text style={commonStyles.sectionHeading}>Goal</Text>
					{/* Current Weight */}
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Current Weight</Text>
						</View>

						{isEditing ? (
							<View style={commonStyles.inputInlineWrapper}>
								<TextInput
									style={commonStyles.input}
									value={startWeight}
									keyboardType="decimal-pad"
									placeholder={isImperial ? "130.0" : "60.0"}
									placeholderTextColor={colors.placeholder}
									onChangeText={setStartWeight}
								/>

								<Text style={commonStyles.inputSuffix}>
									{isImperial ? "lb" : "kg"}
								</Text>
							</View>
						) : (
							<Text style={commonStyles.value}>
								{formatWeightDisplay(startWeight)}
							</Text>
						)}
					</View>

					{/* Target Weight */}
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Target Weight</Text>
						</View>

						{isEditing ? (
							<View style={commonStyles.inputInlineWrapper}>
								<TextInput
									style={commonStyles.input}
									value={targetWeight}
									keyboardType="decimal-pad"
									placeholder={isImperial ? "120.0" : "55.0"}
									placeholderTextColor={colors.placeholder}
									onChangeText={setTargetWeight}
								/>

								<Text style={commonStyles.inputSuffix}>
									{isImperial ? "lb" : "kg"}
								</Text>
							</View>
						) : (
							<Text style={commonStyles.value}>
								{formatWeightDisplay(targetWeight)}
							</Text>
						)}
					</View>

					{/* Target Date */}
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Target Date</Text>
						</View>

						{isEditing ? (
							<Pressable
								style={commonStyles.dropdownTrigger}
								onPress={() => setTargetDatePickerVisible(true)}
							>
								<Text style={commonStyles.dropdownTriggerText}>
									{targetDate || "--"}
								</Text>
								<Ionicons
									name="chevron-down"
									size={14}
									color={colors.textSecondary}
								/>
							</Pressable>
						) : (
							<Text
								style={commonStyles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{targetDate || "--"}
							</Text>
						)}
					</View>

					{/* Activity Level */}
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Activity Level</Text>
						</View>

						{isEditing ? (
							<Pressable
								style={commonStyles.dropdownTrigger}
								onPress={() => setActivityPickerVisible(true)}
							>
								<Text style={commonStyles.dropdownTriggerText}>
									{activity || "--"}
								</Text>
								<Ionicons
									name="chevron-down"
									size={14}
									color={colors.textSecondary}
								/>
							</Pressable>
						) : (
							<Text
								style={commonStyles.value}
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
						<Text style={commonStyles.sectionHeading}>Daily Goal</Text>
						<View style={commonStyles.row}>
							<Text style={commonStyles.label}>Daily Calories</Text>
							<Text style={commonStyles.value}>
								{goalData.goal.dailyCalories} cal
							</Text>
						</View>

						<View style={commonStyles.row}>
							<Text style={commonStyles.label}>Carbs</Text>
							<Text style={commonStyles.value}>{goalData.goal.carbsG} g</Text>
						</View>

						<View style={commonStyles.row}>
							<Text style={commonStyles.label}>Protein</Text>
							<Text style={commonStyles.value}>{goalData.goal.proteinG} g</Text>
						</View>

						<View style={commonStyles.row}>
							<Text style={commonStyles.label}>Fat</Text>
							<Text style={commonStyles.value}>{goalData.goal.fatG} g</Text>
						</View>
					</View>
				)}

				{/* Actions */}
				{isEditing ? (
					<View style={commonStyles.submitActionsContainer}>
						<TouchableOpacity
							style={[commonStyles.actionButton, commonStyles.cancelButton]}
							onPress={handleCancel}
						>
							<Text style={commonStyles.cancelButtonText}>Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[commonStyles.actionButton, commonStyles.saveButton]}
							onPress={handleSave}
							disabled={updating}
						>
							{updating ? (
								<ActivityIndicator
									color={colors.card}
									size="small"
								/>
							) : (
								<Text style={commonStyles.saveButtonText}>Save</Text>
							)}
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						style={commonStyles.submitButton}
						onPress={() => setIsEditing(true)}
					>
						<Text style={commonStyles.submitButtonText}>Edit Goal</Text>
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
					style={commonStyles.modalBackdrop}
					onPress={() => setActivityPickerVisible(false)}
				>
					<Pressable
						style={commonStyles.modalSheet}
						onPress={() => {}}
					>
						<View style={commonStyles.modalHeader}>
							<Text style={commonStyles.modalTitle}>Select Activity Level</Text>
							<TouchableOpacity onPress={() => setActivityPickerVisible(false)}>
								<Text style={commonStyles.modalDoneText}>Done</Text>
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
									style={commonStyles.modalOptionRow}
									onPress={() => {
										setActivity(item);
										setActivityPickerVisible(false);
									}}
								>
									<Text
										style={[
											commonStyles.modalOptionText,
											index === selectedActivityIndex &&
												commonStyles.modalOptionTextSelected,
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
				value={parseISODate(targetDate)}
				onChange={(date) => setTargetDate(formatDateToISO(date))}
				onClose={() => setTargetDatePickerVisible(false)}
			/>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	detailsCard: { ...commonStyles.card, marginBottom: 24 },
});
