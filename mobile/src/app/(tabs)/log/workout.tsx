import { DatePickerModal } from "@/components/date-picker-modal";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { colors } from "@/styles/colors";
import { commonStyles, rowLayout } from "@/styles/common";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
	Alert,
	FlatList,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type Exercise = {
	id: string;
	name: string;
	type: string;
	metValue: number | null;
};
type ExercisesData = { exercises: Exercise[] };
type LogWorkoutData = {
	logWorkout: { exerciseName: string; caloriesBurned: number | null };
};
type LogWorkoutVariables = {
	exerciseId: string;
	sets: number | null;
	reps: number | null;
	weight: number | null;
	weightType: string | null;
	durationMin: number | null;
	logDate: string;
};

const EXERCISES: TypedDocumentNode<ExercisesData> = gql`
	query {
		exercises {
			id
			name
			type
			metValue
		}
	}
`;

const LOG_WORKOUT: TypedDocumentNode<LogWorkoutData, LogWorkoutVariables> = gql`
	mutation LogWorkout(
		$exerciseId: ID!
		$sets: Int
		$reps: Int
		$weight: Float
		$weightType: String
		$durationMin: Int
		$logDate: Date
	) {
		logWorkout(
			exerciseId: $exerciseId
			sets: $sets
			reps: $reps
			weight: $weight
			weightType: $weightType
			durationMin: $durationMin
			logDate: $logDate
		) {
			exerciseName
			caloriesBurned
		}
	}
`;

const FILTERS = ["ALL", "STRENGTH", "CARDIO", "FLEXIBILITY"] as const;

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
	STRENGTH: "barbell",
	CARDIO: "walk",
	FLEXIBILITY: "body",
};

export default function LogWorkoutScreen() {
	const { data, loading } = useQuery(EXERCISES);
	const [logWorkout, { loading: saving }] = useMutation(LOG_WORKOUT);

	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
	const [selected, setSelected] = useState<Exercise | null>(null);

	const [datePickerVisible, setDatePickerVisible] = useState(false);

	const [sets, setSets] = useState("");
	const [reps, setReps] = useState("");
	const [weight, setWeight] = useState("");
	const [weightType, setWeightType] = useState("KG");
	const [duration, setDuration] = useState("");
	const [date, setDate] = useState(formatDateToISO(new Date()));

	const filteredExercises = useMemo(() => {
		return (data?.exercises ?? []).filter((ex) => {
			const matchesFilter = filter === "ALL" || ex.type === filter;
			const matchesSearch = ex.name
				.toLowerCase()
				.includes(search.toLowerCase());
			return matchesFilter && matchesSearch;
		});
	}, [data, search, filter]);

	const isStrength = selected?.type === "STRENGTH";

	const resetForm = () => {
		setSets("");
		setReps("");
		setWeight("");
		setDuration("");
	};

	const handleLog = async () => {
		if (!selected) return;

		try {
			const result = await logWorkout({
				variables: {
					exerciseId: selected.id,
					sets: sets ? parseInt(sets, 10) : null,
					reps: reps ? parseInt(reps, 10) : null,
					weight: weight ? parseFloat(weight) : null,
					weightType: weightType,
					durationMin: duration ? parseInt(duration, 10) : null,
					logDate: date,
				},
			});
			const calories = result.data?.logWorkout?.caloriesBurned;
			Alert.alert(
				"Logged",
				calories ? `~${Math.round(calories)} cal burned` : "Workout saved",
			);
			resetForm();
			setSelected(null);
		} catch (e: any) {
			Alert.alert("Error", e.message);
		}
	};

	//Step 2: details form for the selected exercise
	if (selected) {
		return (
			<ScrollView style={commonStyles.container}>
				<View style={styles.header}>
					<Ionicons
						name={TYPE_ICON[selected.type] ?? "fitness"}
						size={20}
						color="#4bb7e1"
						style={styles.headerIcon}
					/>
					<Text style={styles.headerTitle}>{selected.name}</Text>
					<TouchableOpacity onPress={() => setSelected(null)}>
						<Text style={styles.changeText}>Back</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.menuContainer}>
					<Text style={commonStyles.sectionHeading}>Workout</Text>
					{isStrength ? (
						<View>
							<View style={styles.row}>
								<View style={commonStyles.leftContainer}>
									<Text style={styles.label}>Sets</Text>
								</View>

								<View style={commonStyles.inputInlineWrapper}>
									<TextInput
										value={sets}
										onChangeText={setSets}
										keyboardType="numeric"
										placeholderTextColor="#C7C7CC"
										style={styles.input}
									/>
								</View>
							</View>

							<View style={styles.row}>
								<View style={commonStyles.leftContainer}>
									<Text style={styles.label}>Reps </Text>
								</View>

								<View style={commonStyles.inputInlineWrapper}>
									<TextInput
										value={reps}
										onChangeText={setReps}
										keyboardType="numeric"
										placeholderTextColor="#C7C7CC"
										style={styles.input}
									/>
								</View>
							</View>

							<View style={styles.row}>
								<View style={commonStyles.leftContainer}>
									<Text style={styles.label}>Weight</Text>
								</View>

								<View style={commonStyles.inputInlineWrapper}>
									<TextInput
										value={weight}
										onChangeText={setWeight}
										keyboardType="numeric"
										placeholderTextColor="#C7C7CC"
										style={styles.input}
									/>
								</View>
							</View>

							<View style={styles.row}>
								<View style={commonStyles.leftContainer}>
									<Text style={styles.label}>Weight Type</Text>
								</View>

								<View style={styles.optionGroup}>
									{(["KG", "LB"] as const).map((option) => (
										<Pressable
											key={option}
											onPress={() => setWeightType(option)}
											style={[
												commonStyles.optionPill,
												{
													borderColor:
														weightType === option ? "#4bb7e1" : "#ccc",
													backgroundColor:
														weightType === option ? "#4bb7e1" : "#fff",
												},
											]}
										>
											<Text
												style={{
													color: weightType === option ? "#fff" : "#000",
												}}
											>
												{option}
											</Text>
										</Pressable>
									))}
								</View>
							</View>
						</View>
					) : (
						<View style={styles.row}>
							<View style={commonStyles.leftContainer}>
								<Text style={styles.label}>Duration (minutes)</Text>
							</View>

							<View style={commonStyles.inputInlineWrapper}>
								<TextInput
									style={styles.input}
									value={duration}
									keyboardType="decimal-pad"
									placeholderTextColor="#C7C7CC"
									onChangeText={setDuration}
								/>

								<Text style={commonStyles.inputSuffix}>Min</Text>
							</View>
						</View>
					)}
				</View>

				<View style={styles.menuContainer}>
					<Text style={commonStyles.sectionHeading}>Date</Text>

					<Pressable
						style={styles.dropdownTrigger}
						onPress={() => setDatePickerVisible(true)}
					>
						<Text style={commonStyles.dropdownTriggerText}>{date || "--"}</Text>
						<Ionicons
							name="chevron-down"
							size={14}
							color="#8E8E93"
						/>
					</Pressable>
				</View>

				<TouchableOpacity
					onPress={handleLog}
					disabled={saving}
					style={styles.submitButton}
				>
					<Text style={styles.submitButtonText}>
						{saving ? "Saving..." : "Log workout"}
					</Text>
				</TouchableOpacity>

				<DatePickerModal
					visible={datePickerVisible}
					title="Select Date"
					value={parseISODate(date)}
					maximumDate={new Date()}
					onChange={(date) => setDate(formatDateToISO(date))}
					onClose={() => setDatePickerVisible(false)}
				/>
			</ScrollView>
		);
	}

	//  Step 1: search + pick an exercise
	return (
		<ScrollView
			style={commonStyles.container}
			bounces={false}
			showsVerticalScrollIndicator={false}
		>
			<Text style={commonStyles.heading}>What workout did you do?</Text>

			<View style={styles.menuContainer}>
				<TextInput
					value={search}
					onChangeText={setSearch}
					placeholder="Search exercises..."
					placeholderTextColor="#C7C7CC"
					style={styles.searchInput}
				/>

				<View style={styles.filters}>
					{FILTERS.map((f) => (
						<TouchableOpacity
							key={f}
							onPress={() => setFilter(f)}
							style={[
								styles.filterChip,
								filter === f && styles.filterChipActive,
							]}
						>
							<Text
								style={[
									styles.filterChipText,
									filter === f && styles.filterChipTextActive,
								]}
							>
								{f}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			<View style={styles.menuContainer}>
				{loading ? (
					<Text style={styles.cardText}>Loading exercises...</Text>
				) : (
					<FlatList
						data={filteredExercises}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => setSelected(item)}
								style={styles.row}
							>
								<Ionicons
									name={TYPE_ICON[item.type] ?? "fitness"}
									size={18}
									color="#8E8E93"
									style={styles.exerciseIcon}
								/>
								<Text style={styles.exerciseName}>{item.name}</Text>
							</TouchableOpacity>
						)}
						ListEmptyComponent={
							<Text style={styles.cardText}>No exercises found</Text>
						}
					/>
				)}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	menuContainer: { ...commonStyles.card, marginBottom: 16 },
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	headerIcon: { marginRight: 8 },
	headerTitle: { fontSize: 18, fontWeight: "600", flex: 1, color: colors.textPrimary },
	changeText: { color: colors.primary, fontSize: 14 },
	row: { ...rowLayout, gap: 10 },
	label: { fontSize: 15, color: colors.textPrimary, fontWeight: "500", marginBottom: 4 },
	cardText: { fontSize: 15, color: colors.textSecondary, paddingVertical: 14 },

	input: {
		fontSize: 15,
		color: colors.textPrimary,
		backgroundColor: colors.background,
		borderRadius: 6,
		paddingHorizontal: 10,
		paddingVertical: 8,
		flex: 0,
		width: 90,
	},

	optionGroup: {
		flexDirection: "row",
		justifyContent: "flex-end",
		flex: 1,
		gap: 10,
	},

	dropdownTrigger: {
		...commonStyles.dropdownTrigger,
		paddingBottom: 14,
	},

	submitButton: { ...commonStyles.saveButton, height: 48, marginTop: 12 },
	submitButtonText: commonStyles.saveButtonText,
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
	filters: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 16,
		flexWrap: "wrap",
	},
	filterChip: {
		paddingVertical: 6,
		paddingHorizontal: 9,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.cancel,
		backgroundColor: colors.card,
	},
	filterChipActive: {
		borderColor: colors.primary,
		backgroundColor: colors.primary,
	},
	filterChipText: { fontSize: 12, color: colors.textSecondary },
	filterChipTextActive: { color: colors.card },
	exerciseIcon: { marginRight: 10 },
	exerciseName: { fontSize: 15, color: colors.textPrimary },
});
