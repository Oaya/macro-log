import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const CHART_WIDTH = Dimensions.get("window").width - 20 * 2 - 16 * 2;

type MetricChartProps = {
	title: string;
	data: { value: number; label: string }[];
	unit: string;
};

export function MetricChart({ title, data, unit }: MetricChartProps) {
	if (data.length < 2) return null;

	return (
		<View style={commonStyles.card}>
			<Text style={styles.sectionHeading}>{title}</Text>

			<View style={styles.chartWrapper}>
				<Text style={styles.unitLabel}>{`(${unit})`}</Text>

				<LineChart
					data={data}
					width={CHART_WIDTH}
					height={160}
					color={colors.primary}
					thickness={2}
					curved
					areaChart
					startFillColor={colors.primary}
					startOpacity={0.15}
					endOpacity={0}
					initialSpacing={20}
					endSpacing={25}
					hideDataPoints={data.length > 12}
					dataPointsColor={colors.primary}
					yAxisTextStyle={styles.axisText}
					xAxisLabelTextStyle={styles.axisText}
					xAxisColor={colors.border}
					yAxisColor={colors.border}
					rulesColor={colors.border}
					noOfSections={4}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	sectionHeading: { ...commonStyles.sectionHeading, marginBottom: 20 },
	chartWrapper: { position: "relative" },
	unitLabel: {
		position: "absolute",
		top: -16,
		left: 26,
		fontSize: 10,
		color: colors.textSecondary,
	},
	axisText: { color: colors.textSecondary, fontSize: 10 },
});
