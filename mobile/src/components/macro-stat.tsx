import { colors } from "@/styles/colors";
import { StyleSheet, Text, View } from "react-native";

type MacroStatProps = {
	label: string;
	value: number;
	goalValue?: number | null;
	style?: { color: string };
};

export function MacroStat({ label, value, goalValue, style }: MacroStatProps) {
	const isOverGoal = goalValue != null && value > goalValue;

	return (
		<View style={styles.container}>
			<Text style={styles.value}>
				<Text style={{ color: isOverGoal ? colors.danger : style?.color }}>
					{value}
				</Text>
				<Text style={{ color: style?.color }}>
					{goalValue != null ? ` / ${goalValue}g` : "g"}
				</Text>
			</Text>
			<Text style={styles.label}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { alignItems: "center" },
	value: { fontSize: 14, fontWeight: "600" },
	label: { fontSize: 10, color: "#999" },
});
