import { MEAL_TYPE, MealType } from "@/graphql/food";
import { colors } from "@/styles/colors";
import { commonStyles, edgeItemStyle } from "@/styles/common";
import { router } from "expo-router";
import { Coffee, Cookie, Sandwich, UtensilsCrossed } from "lucide-react-native";
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const MEAL_TYPE_ICON: Record<MealType, typeof Coffee> = {
	BREAKFAST: Coffee,
	LUNCH: Sandwich,
	DINNER: UtensilsCrossed,
	SNACK: Cookie,
};

const MEAL_TYPE_LABEL: Record<MealType, string> = {
	BREAKFAST: "Breakfast",
	LUNCH: "Lunch",
	DINNER: "Dinner",
	SNACK: "Snack",
};

type Props = {
	foodLogs: {
		id: string;
		mealType: MealType;
		foodName: string;
		calories: number;
		quantity: number;
	}[];
};

export default function MealHistory({ foodLogs }: Props) {
	return (
		<View style={[commonStyles.menuContainer, commonStyles.menuItemFirst]}>
			<View style={commonStyles.sectionHeaderRow}>
				<Text
					style={[commonStyles.sectionHeading, commonStyles.sectionHeadingFlat]}
				>
					Meals
				</Text>
				<TouchableOpacity onPress={() => router.push("/(tabs)/log/food")}>
					<Text style={commonStyles.addText}>+ Add</Text>
				</TouchableOpacity>
			</View>

			{MEAL_TYPE.map((mealType) => {
				const items = foodLogs.filter((item) => item.mealType === mealType);
				const MealIcon = MEAL_TYPE_ICON[mealType];

				if (items.length === 0) {
					return (
						<View
							key={mealType}
							style={[styles.mealGroup, styles.mealGroupEmpty]}
						>
							<MealIcon
								size={14}
								color={colors.textSecondary}
							/>
							<Text style={styles.mealEmptyText}>
								No {MEAL_TYPE_LABEL[mealType].toLowerCase()} logged
							</Text>
						</View>
					);
				}

				return (
					<View
						key={mealType}
						style={styles.mealGroup}
					>
						<View style={styles.mealGroupIcon}>
							<MealIcon
								size={14}
								color={colors.textSecondary}
							/>
						</View>

						<View style={commonStyles.logRowTextContainer}>
							<Text style={styles.mealGroupLabel}>
								{MEAL_TYPE_LABEL[mealType]}
							</Text>

							<FlatList
								data={items}
								keyExtractor={(item) => item.id}
								scrollEnabled={false}
								renderItem={({ item, index }) => (
									<View
										style={[
											commonStyles.listRow,
											styles.mealLogRow,
											...edgeItemStyle(index, items.length),
										]}
									>
										<View style={commonStyles.logRowTextContainer}>
											<Text
												style={commonStyles.logRowName}
												numberOfLines={1}
											>
												{item.foodName}
											</Text>
											<Text style={commonStyles.logRowSubtitle}>
												{item.quantity} serving(s)
											</Text>
										</View>
										<Text style={commonStyles.logRowValue}>
											{Math.round(item.calories)} cal
										</Text>
									</View>
								)}
							/>
						</View>
					</View>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	mealGroup: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
		marginTop: 10,
		padding: 12,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
	},
	mealGroupEmpty: {
		alignItems: "center",
		padding: 8,
		marginTop: 6,
	},
	mealGroupIcon: { marginTop: 2 },

	mealLogRow: { paddingVertical: 8 },
	mealEmptyText: { paddingVertical: 0, color: colors.primary },
	mealGroupLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: colors.textSecondary,
		marginBottom: 4,
	},
});
