import { MetricChart } from "@/components/metric-chart";
import { PROGRESS_DATA } from "@/graphql/progress";
import { DELETE_BODY_WEIGHT } from "@/graphql/user";
import { cmToDisplayLength, kgToDisplayWeight } from "@/lib/units";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { useMutation, useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Minus, TrendingDown, TrendingUp } from "lucide-react-native";
import moment from "moment";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

const METRICS = [
	{ key: "weightKg", label: "Weight" },
	{ key: "waistCm", label: "Waist" },
	{ key: "hipCm", label: "Hip" },
	{ key: "chestCm", label: "Chest" },
	{ key: "armCm", label: "Arm" },
	{ key: "thighCm", label: "Thigh" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

export default function Progress() {
	const { data, loading, error } = useQuery(PROGRESS_DATA);
	const [deleteBodyWeight] = useMutation(DELETE_BODY_WEIGHT, {
		refetchQueries: ["ProgressData"],
	});
	const [metric, setMetric] = useState<MetricKey>("weightKg");

	const bodyWeights = data?.bodyWeights ?? [];
	const isImperial = data?.me.unitPreference?.toUpperCase() === "IMPERIAL";
	const isWeight = metric === "weightKg";
	const unit = isWeight ? (isImperial ? "lb" : "kg") : isImperial ? "in" : "cm";
	const metricLabel = METRICS.find((m) => m.key === metric)!.label;

	const toDisplay = (raw: number | null) =>
		isWeight
			? kgToDisplayWeight(raw, isImperial)
			: cmToDisplayLength(raw, isImperial);

	// Only entries where the selected metric was actually recorded.
	const entries = bodyWeights.filter((entry) => entry[metric] != null);

	const latest = entries[0];
	const earliest = entries[entries.length - 1];
	const change =
		latest && earliest && entries.length > 1
			? (latest[metric] as number) - (earliest[metric] as number)
			: null;

	const chartData = [...entries].reverse().map((entry) => ({
		value: Number(toDisplay(entry[metric] as number)),
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

	const handleDelete = (id: string, date: string) => {
		Alert.alert("Delete entry", `Remove ${date}'s body stats?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					deleteBodyWeight({ variables: { id } }).catch((e: Error) => {
						Alert.alert("Error", e.message);
					});
				},
			},
		]);
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={commonStyles.logRowTextContainer}
		>
			<ScrollView
				style={commonStyles.container}
				bounces={false}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				<Text style={styles.heading}>Progress</Text>

				{/* Metric selector */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.metricSelector}
				>
					{METRICS.map((m) => (
						<TouchableOpacity
							key={m.key}
							onPress={() => setMetric(m.key)}
							style={[
								styles.metricTab,
								metric === m.key && styles.metricTabSelected,
							]}
						>
							<Text
								style={[
									styles.metricTabText,
									metric === m.key && styles.metricTabTextSelected,
								]}
							>
								{m.label}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				{/* Summary card */}
				{latest ? (
					<View style={commonStyles.menuContainer}>
						<Text style={styles.currentWeightLabel}>
							Current {metricLabel.toLowerCase()}
						</Text>
						<Text style={styles.currentWeightValue}>
							{toDisplay(latest[metric])} {unit}
						</Text>
						{change !== null && (
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
									{toDisplay(Math.abs(change))} {unit} since{" "}
									{earliest.recordedDate}
								</Text>
							</View>
						)}
					</View>
				) : (
					<View style={commonStyles.menuContainer}>
						<Text style={styles.emptyText}>
							No {metricLabel.toLowerCase()} entries yet
						</Text>
					</View>
				)}

				{/* Metric trend chart */}
				<MetricChart
					title={`${metricLabel} Trend`}
					data={chartData}
					unit={unit}
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

				{/* History list */}
				<View style={[commonStyles.menuContainer, { paddingTop: 0 }]}>
					<Text style={styles.sectionHeading}>{metricLabel} history</Text>

					<FlatList
						data={entries}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						renderItem={({ item, index }) => (
							<Swipeable
								renderRightActions={() => (
									<TouchableOpacity
										style={commonStyles.deleteAction}
										onPress={() => handleDelete(item.id, item.recordedDate)}
									>
										<Ionicons
											name="trash-outline"
											size={18}
											color={colors.card}
										/>
									</TouchableOpacity>
								)}
							>
								<TouchableOpacity
									style={[
										styles.historyRow,
										index === entries.length - 1 && styles.historyRowLast,
									]}
									onPress={() =>
										router.push({
											pathname: "/(tabs)/log/log-body-stats",
											params: { date: item.recordedDate },
										})
									}
								>
									<Text style={styles.historyDate}>{item.recordedDate}</Text>
									<Text style={styles.historyWeight}>
										{toDisplay(item[metric])} {unit}
									</Text>
								</TouchableOpacity>
							</Swipeable>
						)}
						ListEmptyComponent={
							<Text style={styles.emptyText}>
								No {metricLabel.toLowerCase()} entries yet
							</Text>
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
	scrollContent: { paddingBottom: 100 },
	loadingText: { marginTop: 8 },
	heading: { ...commonStyles.heading, marginTop: 26 },
	metricSelector: { gap: 20, paddingBottom: 12 },
	metricTab: {
		paddingBottom: 8,
		borderBottomWidth: 2,
		borderBottomColor: "transparent",
	},
	metricTabSelected: { borderBottomColor: colors.primary },
	metricTabText: {
		fontSize: 14,
		color: colors.textSecondary,
	},
	metricTabTextSelected: {
		color: colors.textPrimary,
		fontWeight: "600",
	},
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
