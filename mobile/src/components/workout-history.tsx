import { colors } from "@/styles/colors";
import { commonStyles, edgeItemStyle } from "@/styles/common";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
	STRENGTH: "barbell",
	CARDIO: "walk",
	FLEXIBILITY: "body",
};

type Props = {
	workoutLogs: {
		id: string;
		exerciseName: string;
		exerciseType: string;
		durationMin: number | null;
		caloriesBurned: number | null;
	}[];
};

export default function WorkoutHistory({ workoutLogs }: Props) {
	return (
		<View style={[commonStyles.menuContainer, commonStyles.menuItemFirst]}>
			<View style={commonStyles.sectionHeaderRow}>
				<Text
					style={[commonStyles.sectionHeading, commonStyles.sectionHeadingFlat]}
				>
					Workouts
				</Text>
				<TouchableOpacity onPress={() => router.push("/(tabs)/log/workout")}>
					<Text style={commonStyles.addText}>+ Add</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={workoutLogs}
				keyExtractor={(item) => item.id}
				scrollEnabled={false}
				renderItem={({ item, index }) => (
					<View
						style={[
							commonStyles.listRow,
							...edgeItemStyle(index, workoutLogs.length),
						]}
					>
						<Ionicons
							name={TYPE_ICON[item.exerciseType] ?? "fitness"}
							size={18}
							color={colors.textSecondary}
							style={styles.logIcon}
						/>
						<View style={commonStyles.logRowTextContainer}>
							<Text
								style={commonStyles.logRowName}
								numberOfLines={1}
							>
								{item.exerciseName}
							</Text>
							{item.durationMin != null && (
								<Text style={commonStyles.logRowSubtitle}>
									{item.durationMin} min
								</Text>
							)}
						</View>
						{item.caloriesBurned != null && (
							<Text style={commonStyles.logRowValue}>
								{Math.round(item.caloriesBurned)} cal
							</Text>
						)}
					</View>
				)}
				ListEmptyComponent={
					<Text style={commonStyles.cardText}>No workouts logged</Text>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	logIcon: { marginRight: 2 },
});
