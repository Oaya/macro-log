import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

type SummaryData = {
	dailySummary: {
		caloriesConsumed: number;
		caloriesBurned: number;
		netCalories: number;
		proteinG: number;
		carbsG: number;
		fatG: number;

		goalCalories: number | null;
		caloriesRemaining: number | null;
		goalProteinG: number | null;
		goalCarbsG: number | null;
		goalFatG: number | null;
	};
};

const DAILY_SUMMARY = gql`
	query DailySummary($date: Date!) {
		dailySummary(summaryDate: $date) {
			caloriesConsumed
			caloriesBurned
			netCalories
			proteinG
			carbsG
			fatG
			goalCalories
			caloriesRemaining
			goalProteinG
			goalCarbsG
			goalFatG
		}
	}
`;

export default function summary() {
	const today = new Date().toISOString().split("T")[0];
	const { data, loading, error } = useQuery<SummaryData>(DAILY_SUMMARY, {
		variables: { date: today },
	});

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Error: {error.message}</Text>
			</View>
		);
	}

	const s = data?.dailySummary;

	return (
		<ScrollView style={{ flex: 1, padding: 20 }}>
			<Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
				Today's Summary
			</Text>

			<View style={{ gap: 12 }}>
				<Row
					label="Calories eaten"
					value={`${s?.caloriesConsumed ?? 0} cal`}
				/>
				<Row
					label="Calories burned"
					value={`${s?.caloriesBurned ?? 0} cal`}
				/>
				<Row
					label="Net calories"
					value={`${s?.netCalories ?? 0} cal`}
				/>
				{s?.goalCalories != null && (
					<>
						<Row
							label="Goal"
							value={`${s.goalCalories} cal`}
						/>
						<Row
							label="Remaining"
							value={`${s.caloriesRemaining} cal`}
						/>
						<Row
							label="Goal Protein"
							value={`${s.goalProteinG} cal`}
						/>
						<Row
							label="Goal Carbs"
							value={`${s.goalCarbsG} cal`}
						/>
						<Row
							label="Goal Fat"
							value={`${s.goalFatG} cal`}
						/>
					</>
				)}
				<Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 16 }}>
					Macros
				</Text>
				<Row
					label="Protein"
					value={`${s?.proteinG ?? 0} g`}
				/>
				<Row
					label="Carbs"
					value={`${s?.carbsG ?? 0} g`}
				/>
				<Row
					label="Fat"
					value={`${s?.fatG ?? 0} g`}
				/>
			</View>
		</ScrollView>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
			<Text style={{ fontSize: 16 }}>{label}</Text>
			<Text style={{ fontSize: 16, fontWeight: "600" }}>{value}</Text>
		</View>
	);
}
