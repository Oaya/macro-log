import { DatePickerModal } from "@/components/date-picker-modal";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { colors } from "@/styles/colors";
import { commonStyles, rowLayout } from "@/styles/common";
import { EXERCISES, Exercise, LOG_WORKOUT } from "@/graphql/workout";
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

const FILTERS = ["ALL", "STRENGTH", "CARDIO", "FLEXIBILITY"] as const;

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
	STRENGTH: "barbell",
	CARDIO: "walk",
	FLEXIBILITY: "body",
};

export default function LogWorkout() {
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
		setSelected(null);
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
		} catch (e: any) {
			Alert.alert("Error", e.message);
		}
	};

	//Step 2: details form for the selected exercise
	if (selected) {
		return (
			<ScrollView style={commonStyles.container}>
				<View style={commonStyles.header}>
					<Ionicons
						name={TYPE_ICON[selected.type] ?? "fitness"}
						size={20}
						color={colors.primary}
						style={commonStyles.headerIcon}
					/>
					<Text style={commonStyles.headerTitle}>{selected.name}</Text>
					<TouchableOpacity onPress={() => setSelected(null)}>
						<Text style={commonStyles.changeText}>Back</Text>
					</TouchableOpacity>
				</View>

				<View style={commonStyles.menuContainer}>
					<Text style={commonStyles.sectionHeading}>Workout</Text>
					{isStrength ? (
						<View>
							<View style={commonStyles.row}>
								<View style={commonStyles.leftContainer}>
									<Text style={commonStyles.label}>Sets</Text>
								</View>

								<View style={commonStyles.inputInlineWrapper}>
									<TextInput
										value={sets}
										onChangeText={setSets}
										keyboardType="numeric"
										placeholderTextColor={colors.placeholder}
										style={commonStyles.input}
									/>
								</View>
							</View>

							<View style={commonStyles.row}>
								<View style={commonStyles.leftContainer}>
									<Text style={commonStyles.label}>Reps </Text>
								</View>

								<View style={commonStyles.inputInlineWrapper}>
									<TextInput
										value={reps}
										onChangeText={setReps}
										keyboardType="numeric"
										placeholderTextColor={colors.placeholder}
										style={commonStyles.input}
									/>
								</View>
							</View>

							<View style={commonStyles.row}>
								<View style={commonStyles.leftContainer}>
									<Text style={commonStyles.label}>Weight</Text>
								</View>

								<View style={commonStyles.inputInlineWrapper}>
									<TextInput
										value={weight}
										onChangeText={setWeight}
										keyboardType="numeric"
										placeholderTextColor={colors.placeholder}
										style={commonStyles.input}
									/>
								</View>
							</View>

							<View style={commonStyles.row}>
								<View style={commonStyles.leftContainer}>
									<Text style={commonStyles.label}>Weight Type</Text>
								</View>

								<View style={styles.optionGroup}>
									{(["KG", "LB"] as const).map((option) => (
										<Pressable
											key={option}
											onPress={() => setWeightType(option)}
											style={[
												commonStyles.optionPill,
												weightType === option
													? commonStyles.optionPillSelected
													: commonStyles.optionPillUnselected,
											]}
										>
											<Text
												style={
													weightType === option
														? commonStyles.optionPillTextSelected
														: commonStyles.optionPillTextUnselected
												}
											>
												{option}
											</Text>
										</Pressable>
									))}
								</View>
							</View>
						</View>
					) : (
						<View style={commonStyles.row}>
							<View style={commonStyles.leftContainer}>
								<Text style={commonStyles.label}>Duration (minutes)</Text>
							</View>

							<View style={commonStyles.inputInlineWrapper}>
								<TextInput
									style={commonStyles.input}
									value={duration}
									keyboardType="decimal-pad"
									placeholderTextColor={colors.placeholder}
									onChangeText={setDuration}
								/>

								<Text style={commonStyles.inputSuffix}>Min</Text>
							</View>
						</View>
					)}
				</View>

				<View style={commonStyles.menuContainer}>
					<Text style={commonStyles.sectionHeading}>Date</Text>

					<Pressable
						style={styles.dropdownTrigger}
						onPress={() => setDatePickerVisible(true)}
					>
						<Text style={commonStyles.dropdownTriggerText}>{date || "--"}</Text>
						<Ionicons
							name="chevron-down"
							size={14}
							color={colors.textSecondary}
						/>
					</Pressable>
				</View>

				<TouchableOpacity
					onPress={handleLog}
					disabled={saving}
					style={commonStyles.submitButtonTight}
				>
					<Text style={commonStyles.submitButtonText}>
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

			<View style={commonStyles.menuContainer}>
				<TextInput
					value={search}
					onChangeText={setSearch}
					placeholder="Search exercises..."
					placeholderTextColor={colors.placeholder}
					style={commonStyles.searchInput}
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

			<View style={commonStyles.menuContainer}>
				{loading ? (
					<Text style={commonStyles.cardText}>Loading exercises...</Text>
				) : (
					<FlatList
						data={filteredExercises}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => setSelected(item)}
								style={styles.exerciseRow}
							>
								<Ionicons
									name={TYPE_ICON[item.type] ?? "fitness"}
									size={18}
									color={colors.textSecondary}
									style={styles.exerciseIcon}
								/>
								<Text style={styles.exerciseName}>{item.name}</Text>
							</TouchableOpacity>
						)}
						ListEmptyComponent={
							<Text style={commonStyles.cardText}>No exercises found</Text>
						}
					/>
				)}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	exerciseRow: { ...rowLayout, gap: 10 },
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
