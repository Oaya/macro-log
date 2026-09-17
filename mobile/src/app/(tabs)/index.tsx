import { DatePickerModal } from "@/components/date-picker-modal";
import { MacroStat } from "@/components/macro-stat";
import { HOME_DATA } from "@/graphql/home";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

	console.log("d", data);

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
			style={styles.flex1}
		>
			<ScrollView
				style={commonStyles.container}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<Pressable
					style={commonStyles.dropdownTrigger}
					onPress={() => setDatePickerVisible(true)}
				>
					<Text style={styles.heading}>{displayDate}</Text>
					<Ionicons
						name="chevron-down"
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
						{data.bodyWeights.length > 0 && (
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 10,
									backgroundColor: "#f5f5f5",
									borderRadius: 12,
									padding: 12,
									marginBottom: 16,
								}}
							>
								<Ionicons
									name="scale-outline"
									size={18}
									color="#34C759"
								/>
								<Text style={{ flex: 1, fontSize: 13, color: "#666" }}>
									Weight logged
								</Text>
								<Text style={{ fontSize: 15, fontWeight: "600" }}>
									{data.bodyWeights[0].weightKg} kg
								</Text>
							</View>
						)}

						{/* Meals */}
						<SectionHeader
							title="Meals"
							onAdd={() => router.push("/(tabs)/log/food")}
						/>
						<View
							style={{
								backgroundColor: "#f5f5f5",
								borderRadius: 12,
								paddingHorizontal: 14,
								marginBottom: 16,
							}}
						>
							{data.foodLogs.length === 0 ? (
								<Text style={{ color: "#999", paddingVertical: 12 }}>
									No meals logged
								</Text>
							) : (
								data.foodLogs.map((log, i) => (
									<View
										key={log.id}
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: 10,
											paddingVertical: 10,
											borderBottomWidth: i < data.foodLogs.length - 1 ? 1 : 0,
											borderBottomColor: "#e5e5e5",
										}}
									>
										<View style={{ flex: 1 }}>
											<Text style={{ fontSize: 13, fontWeight: "500" }}>
												{log.foodName}
											</Text>
											<Text style={{ fontSize: 11, color: "#999" }}>
												{log.mealType.charAt(0) +
													log.mealType.slice(1).toLowerCase()}{" "}
												· {log.quantity} serving(s)
											</Text>
										</View>
										<Text style={{ fontSize: 12, color: "#666" }}>
											{Math.round(log.calories)} cal
										</Text>
									</View>
								))
							)}
						</View>

						{/* Workouts */}
						<SectionHeader
							title="Workouts"
							onAdd={() => router.push("/(tabs)/log/workout")}
						/>
						<View
							style={{
								backgroundColor: "#f5f5f5",
								borderRadius: 12,
								paddingHorizontal: 14,
								marginBottom: 20,
							}}
						>
							{data.workoutLogs.length === 0 ? (
								<Text style={{ color: "#999", paddingVertical: 12 }}>
									No workouts logged
								</Text>
							) : (
								data.workoutLogs.map((log, i) => (
									<View
										key={log.id}
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: 10,
											paddingVertical: 10,
											borderBottomWidth:
												i < data.workoutLogs.length - 1 ? 1 : 0,
											borderBottomColor: "#e5e5e5",
										}}
									>
										<View style={{ flex: 1 }}>
											<Text style={{ fontSize: 13, fontWeight: "500" }}>
												{log.exerciseName}
											</Text>
											{log.durationMin != null && (
												<Text style={{ fontSize: 11, color: "#999" }}>
													{log.durationMin} min
												</Text>
											)}
										</View>
										{log.caloriesBurned != null && (
											<Text style={{ fontSize: 12, color: "#666" }}>
												{Math.round(log.caloriesBurned)} cal
											</Text>
										)}
									</View>
								))
							)}
						</View>
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

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
	return (
		<View
			style={{
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: 8,
			}}
		>
			<Text style={{ fontSize: 14, fontWeight: "600" }}>{title}</Text>
			<TouchableOpacity onPress={onAdd}>
				<Text style={{ fontSize: 12, color: "#007AFF" }}>+ Add</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	flex1: { flex: 1 },
	loadingText: { marginTop: 8 },
	heading: { ...commonStyles.heading, marginTop: 30 },
});
