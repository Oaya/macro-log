import { DELETE_WORKOUT_LOG } from "@/graphql/workout";
import { colors } from "@/styles/colors";
import { commonStyles, edgeItemStyle } from "@/styles/common";
import { useMutation } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

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
	const [deleteWorkoutLog] = useMutation(DELETE_WORKOUT_LOG, {
		refetchQueries: ["HomeData"],
	});

	const handleDelete = (id: string, workoutName: string) => {
		Alert.alert("Delete entry", `Remove "${workoutName}" from today's log?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					deleteWorkoutLog({ variables: { id } }).catch((e: Error) => {
						Alert.alert("Error", e.message);
					});
				},
			},
		]);
	};

	return (
		<View style={commonStyles.card}>
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
					<Swipeable
						renderRightActions={() => (
							<TouchableOpacity
								style={commonStyles.deleteAction}
								onPress={() => handleDelete(item.id, item.exerciseName)}
							>
								<Ionicons
									name="trash-outline"
									size={18}
									color={colors.card}
								/>
							</TouchableOpacity>
						)}
					>
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
					</Swipeable>
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
