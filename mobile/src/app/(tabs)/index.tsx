import { DatePickerModal } from "@/components/date-picker-modal";
import { MacroStat } from "@/components/macro-stat";
import MealHistory from "@/components/meal-history";
import WorkoutHistory from "@/components/workout-history";
import { HOME_DATA } from "@/graphql/home";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { kgToDisplayWeight } from "@/lib/units";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ChevronDown } from "lucide-react-native";

import moment from "moment";
import { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";

export default function Index() {
	const [date, setDate] = useState(formatDateToISO(new Date()));
	const [datePickerVisible, setDatePickerVisible] = useState(false);

	const { data, loading, error } = useQuery(HOME_DATA, {
		variables: { date: date },
	});

	const router = useRouter();

	const today = formatDateToISO(new Date());
	const yesterday = formatDateToISO(moment(today).subtract(1, "day").toDate());
	const tomorrow = formatDateToISO(moment(today).add(1, "day").toDate());
	const displayDate =
		date === today
			? "Today"
			: date === yesterday
				? "Yesterday"
				: date === tomorrow
					? "Tomorrow"
					: date;

	const isImperial = data?.me.unitPreference?.toUpperCase() === "IMPERIAL";

	const summary = data?.dailySummary;
	const goalCalories = summary?.goalCalories ?? null;
	const consumed = summary?.caloriesConsumed ?? 0;

	const proteinCal = (summary?.proteinG ?? 0) * 4;
	const carbsCal = (summary?.carbsG ?? 0) * 4;
	const fatCal = (summary?.fatG ?? 0) * 9;
	const totalMacroCal = proteinCal + carbsCal + fatCal;
	const macroChartData = totalMacroCal
		? [
				{ value: (proteinCal / totalMacroCal) * 100, color: "#34C759" },
				{ value: (carbsCal / totalMacroCal) * 100, color: "#007AFF" },
				{ value: (fatCal / totalMacroCal) * 100, color: "#FF9500" },
			]
		: [{ value: 100, color: "#ddd" }];

	if (loading) {
		return (
			<View style={commonStyles.loadingCard}>
				<ActivityIndicator size="large" />
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={commonStyles.errorCard}>
				<Text style={commonStyles.errorText}>Error: {error.message}</Text>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={commonStyles.logRowTextContainer}
		>
			<ScrollView
				style={commonStyles.container}
				contentContainerStyle={styles.scrollContent}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<Pressable
					style={commonStyles.dropdownTrigger}
					onPress={() => setDatePickerVisible(true)}
				>
					<Text style={styles.heading}>{displayDate}</Text>
					<ChevronDown
						size={20}
						color={colors.textSecondary}
					/>
				</Pressable>

				{/* Summary card */}
				{summary && (
					<>
						{/* Calorie ring + stats */}
						<View style={commonStyles.menuContainer}>
							<View
								style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
							>
								<View style={{ width: 84, height: 84 }}>
									<PieChart
										donut
										radius={42}
										innerRadius={34}
										data={macroChartData}
										curvedStartEdges
										curvedEndEdges
										centerLabelComponent={() => (
											<View style={{ alignItems: "center" }}>
												<Text style={{ fontSize: 17, fontWeight: "bold" }}>
													{Math.round(consumed)}
												</Text>
												<Text style={{ fontSize: 9, color: "#999" }}>
													{goalCalories ? `of ${goalCalories}` : "consumed"}
												</Text>
											</View>
										)}
									/>
								</View>

								<View style={{ flex: 1, gap: 6 }}>
									<StatRow
										label="Calories Burned"
										value={`${Math.round(summary.caloriesBurned)} cal`}
									/>
									<StatRow
										label="Net"
										value={`${Math.round(summary.netCalories)} cal`}
									/>
									{summary.caloriesRemaining != null && (
										<StatRow
											label="Remaining"
											value={`${Math.round(summary.caloriesRemaining)} cal`}
											highlight
										/>
									)}
								</View>
							</View>

							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-around",
									marginTop: 14,
									paddingTop: 12,
									borderTopWidth: 1,
									borderTopColor: "#e5e5e5",
								}}
							>
								<MacroStat
									label="protein"
									style={{ color: "#34C759" }}
									value={Math.round(summary.proteinG)}
									goalValue={summary.goalProteinG}
								/>
								<MacroStat
									label="carbs"
									style={{ color: "#007AFF" }}
									value={Math.round(summary.carbsG)}
									goalValue={summary.goalCarbsG}
								/>
								<MacroStat
									label="fat"
									style={{ color: "#FF9500" }}
									value={Math.round(summary.fatG)}
									goalValue={summary.goalFatG}
								/>
							</View>
						</View>

						{/* Today's weight */}

						<View style={[commonStyles.menuContainer, styles.weightRow]}>
							<Ionicons
								name="scale-outline"
								size={18}
								color={colors.primary}
							/>
							{data.todayBodyWeight ? (
								<>
									<Text style={styles.weightLabel}>Weight logged</Text>
									<Text style={styles.weightValue}>
										{kgToDisplayWeight(
											data.todayBodyWeight.weightKg,
											isImperial,
										)}{" "}
										{isImperial ? "lb" : "kg"}
									</Text>
								</>
							) : (
								<>
									<Text style={styles.weightLabel}>No weight logged</Text>
									<TouchableOpacity
										onPress={() => router.push("/(tabs)/log/weight")}
									>
										<Text style={commonStyles.addText}>+ Add</Text>
									</TouchableOpacity>
								</>
							)}
						</View>

						{/* Meals */}
						<MealHistory foodLogs={data.foodLogs} />

						{/* Workouts */}
						<WorkoutHistory workoutLogs={data.workoutLogs} />
					</>
				)}
			</ScrollView>

			<DatePickerModal
				visible={datePickerVisible}
				title="Select Date"
				value={parseISODate(date)}
				onChange={(date) => {
					setDate(formatDateToISO(date));
					setDatePickerVisible(false);
				}}
				onClose={() => setDatePickerVisible(false)}
			/>
		</KeyboardAvoidingView>
	);
}

function StatRow({
	label,
	value,
	highlight,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	return (
		<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
			<Text
				style={{ fontSize: 12, color: highlight ? colors.primary : "#666" }}
			>
				{label}
			</Text>
			<Text
				style={{
					fontSize: 12,
					fontWeight: "600",
					color: highlight ? colors.primary : "#000",
				}}
			>
				{value}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	scrollContent: { paddingBottom: 100 },
	loadingText: { marginTop: 8 },
	heading: { ...commonStyles.heading, marginTop: 30 },
	weightRow: { flexDirection: "row", alignItems: "center", gap: 10 },
	weightLabel: { flex: 1, fontSize: 13, color: colors.textSecondary },
	weightValue: { fontSize: 15, fontWeight: "600" },
});
