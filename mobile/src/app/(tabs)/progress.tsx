import { WeightChart } from "@/components/weight-chart";
import { PROGRESS_DATA } from "@/graphql/progress";
import { kgToDisplayWeight } from "@/lib/units";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { useQuery } from "@apollo/client/react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react-native";
import moment from "moment";
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

export default function Progress() {
	const { data, loading, error } = useQuery(PROGRESS_DATA);

	const bodyWeights = data?.bodyWeights ?? [];

	const latest = bodyWeights[0];
	const earliest = bodyWeights[bodyWeights.length - 1];
	const change =
		latest && earliest ? latest.weightKg - earliest.weightKg : null;

	const isImperial = data?.me.unitPreference?.toUpperCase() === "IMPERIAL";
	const weightUnit = isImperial ? "lb" : "kg";

	const chartData = [...bodyWeights].reverse().map((entry) => ({
		value: Number(kgToDisplayWeight(entry.weightKg, isImperial)),
		label: moment(entry.recordedDate, "YYYY-MM-DD").format("MMM D"),
	}));

	const trendColor =
		change === null || change === 0
			? colors.textSecondary
			: change < 0
				? colors.trendDown
				: colors.trendUp;

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
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.heading}>Progress</Text>
				{/* Summary card */}
				{latest && (
					<View style={commonStyles.menuContainer}>
						<Text style={styles.currentWeightLabel}>Current weight</Text>
						<Text style={styles.currentWeightValue}>
							{kgToDisplayWeight(latest.weightKg, isImperial)} {weightUnit}
						</Text>
						{change !== null && bodyWeights.length > 1 && (
							<View style={styles.changeRow}>
								{change < 0 ? (
									<TrendingDown
										size={14}
										color={trendColor}
									/>
								) : change > 0 ? (
									<TrendingUp
										size={14}
										color={trendColor}
									/>
								) : (
									<Minus
										size={14}
										color={trendColor}
									/>
								)}
								<Text style={[styles.changeText, { color: trendColor }]}>
									{kgToDisplayWeight(Math.abs(change), isImperial)} {weightUnit}{" "}
									since {earliest.recordedDate}
								</Text>
							</View>
						)}
					</View>
				)}

				{/* Weight trend chart */}
				<WeightChart
					data={chartData}
					unit={weightUnit}
				/>

				{/* Goal targets */}
				{data?.goal && (
					<View style={[commonStyles.menuContainer, { paddingTop: 0 }]}>
						<Text style={styles.sectionHeading}>Daily Target</Text>
						<View style={styles.statsRow}>
							<StatBox
								label="cal"
								value={data.goal.dailyCalories}
							/>
							<StatBox
								label="protein"
								value={`${data.goal.proteinG}g`}
							/>
							<StatBox
								label="carbs"
								value={`${data.goal.carbsG}g`}
							/>
							<StatBox
								label="fat"
								value={`${data.goal.fatG}g`}
							/>
						</View>
					</View>
				)}

				{/* Weight history list */}
				<View style={[commonStyles.menuContainer, { paddingTop: 0 }]}>
					<Text style={styles.sectionHeading}>Weight history</Text>

					<FlatList
						data={bodyWeights}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						renderItem={({ item, index }) => (
							<View
								style={[
									styles.historyRow,
									index === bodyWeights.length - 1 && styles.historyRowLast,
								]}
							>
								<Text style={styles.historyDate}>{item.recordedDate}</Text>
								<Text style={styles.historyWeight}>
									{kgToDisplayWeight(item.weightKg, isImperial)} {weightUnit}
								</Text>
							</View>
						)}
						ListEmptyComponent={
							<Text style={styles.emptyText}>No weight entries yet</Text>
						}
					/>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

function StatBox({ label, value }: { label: string; value: string | number }) {
	return (
		<View style={styles.statContainer}>
			<Text style={styles.statValue}>{value}</Text>
			<Text style={styles.statLabel}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	loadingText: { marginTop: 8 },
	heading: { ...commonStyles.heading, marginTop: 26 },
	currentWeightLabel: { fontSize: 13, color: colors.textSecondary },
	currentWeightValue: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
	changeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
	changeText: { fontSize: 13 },

	sectionHeading: { ...commonStyles.sectionHeading, marginBottom: 10 },
	statsRow: { flexDirection: "row", gap: 8 },
	statContainer: {
		flex: 1,
		backgroundColor: colors.card,
		borderRadius: 8,
		paddingTop: 10,
		alignItems: "center",
	},
	statValue: { fontSize: 15, fontWeight: "600" },
	statLabel: { fontSize: 10, color: colors.textSecondary },
	historyRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	historyRowLast: { borderBottomWidth: 0 },
	historyDate: { color: colors.textSecondary },
	historyWeight: { fontWeight: "600" },
	emptyText: { color: colors.textSecondary },
});
