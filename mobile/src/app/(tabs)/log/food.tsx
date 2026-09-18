import { DatePickerModal } from "@/components/date-picker-modal";
import { TextInput } from "@/components/text-input";
import {
	FoodResult,
	LOG_FOOD,
	MEAL_TYPE,
	MealType,
	MY_FOODS,
	RECENT_FOODS,
	SEARCH_FOODS,
} from "@/graphql/food";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { colors } from "@/styles/colors";
import { commonStyles, edgeItemStyle, rowLayout } from "@/styles/common";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
	Alert,
	FlatList,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

function defaultMealType(): MealType {
	const hour = new Date().getHours();
	if (hour < 11) return "BREAKFAST";
	if (hour < 16) return "LUNCH";
	if (hour < 21) return "DINNER";
	return "SNACK";
}

export default function LogFood() {
	const params = useLocalSearchParams<{ createdFood?: string }>();

	const [activeTab, setActiveTab] = useState<"recent" | "my">("recent");
	const [runSearch, { data, loading }] = useLazyQuery(SEARCH_FOODS);
	const { data: recentData, loading: recentLoading } = useQuery(RECENT_FOODS);
	const { data: myFoodsData, loading: myFoodsLoading } = useQuery(MY_FOODS);

	const [logFood, { loading: saving }] = useMutation(LOG_FOOD, {
		refetchQueries: ["HomeData"],
	});

	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<FoodResult | null>(null);

	const [handledCreatedFood, setHandledCreatedFood] = useState<
		string | undefined
	>(undefined);
	if (params.createdFood && params.createdFood !== handledCreatedFood) {
		setHandledCreatedFood(params.createdFood);
		try {
			setSelected(JSON.parse(params.createdFood));
		} catch {}
	}

	useEffect(() => {
		if (handledCreatedFood !== undefined) {
			router.setParams({ createdFood: undefined });
		}
	}, [handledCreatedFood]);

	const [datePickerVisible, setDatePickerVisible] = useState(false);
	const [date, setDate] = useState(formatDateToISO(new Date()));
	const [quantity, setQuantity] = useState("1");
	const [mealType, setMealType] = useState<MealType>(defaultMealType());

	const handleSearch = (text: string) => {
		setSearch(text);
		if (text.trim().length > 1) {
			runSearch({ variables: { query: text } });
		}
	};

	const isSearching = search.trim().length > 1;

	const displayedFoods = isSearching
		? (data?.searchFoods ?? [])
		: activeTab === "recent"
			? (recentData?.recentFoods ?? [])
			: (myFoodsData?.myFoods ?? []);

	const listLoading = isSearching
		? loading
		: activeTab === "recent"
			? recentLoading
			: myFoodsLoading;

	const qty = parseFloat(quantity) || 0;

	const preview = useMemo(() => {
		if (!selected) return null;
		return {
			calories: Math.round(selected.calories * qty),
			protein: Math.round(selected.proteinG * qty * 10) / 10,
			carbs: Math.round(selected.carbsG * qty * 10) / 10,
			fat: Math.round(selected.fatG * qty * 10) / 10,
		};
	}, [selected, qty]);

	const resetForm = () => {
		setSelected(null);
		setQuantity("1");
		setMealType(defaultMealType());
	};

	const handleLog = async () => {
		if (!selected || qty <= 0) {
			Alert.alert("Enter a valid quantity");
			return;
		}

		try {
			await logFood({
				variables: {
					food: {
						name: selected.name,
						servingSize: selected.servingSize,
						calories: selected.calories,
						proteinG: selected.proteinG,
						carbsG: selected.carbsG,
						fatG: selected.fatG,
						fiberG: selected.fiberG,
						sodiumMg: selected.sodiumMg,
					},
					quantity: qty,
					mealType: mealType,
					logDate: date,
				},
			});
			Alert.alert(
				"Logged",
				`${selected.name} added to ${mealType.toLowerCase()}`,
			);
			resetForm();
		} catch (e: any) {
			Alert.alert("Error", e.message);
		}
	};

	//Step 2: details form for the selected exercise
	if (selected) {
		return (
			<ScrollView style={commonStyles.container}>
				<View style={commonStyles.header}>
					<Ionicons
						name="restaurant"
						size={18}
						color="#007AFF"
						style={commonStyles.headerIcon}
					/>
					<Text style={commonStyles.headerTitle}>{selected.name}</Text>
					<TouchableOpacity onPress={() => setSelected(null)}>
						<Text style={commonStyles.changeText}>Back</Text>
					</TouchableOpacity>
				</View>

				{preview && (
					<View style={styles.macroCardsRow}>
						<MacroCard
							label="cal"
							value={preview.calories}
						/>
						<MacroCard
							label="protein"
							value={`${preview.protein}g`}
						/>
						<MacroCard
							label="carbs"
							value={`${preview.carbs}g`}
						/>
						<MacroCard
							label="fat"
							value={`${preview.fat}g`}
						/>
					</View>
				)}

				<View style={commonStyles.menuContainer}>
					<Text style={commonStyles.sectionHeading}>Meal log</Text>
					<View>
						<View style={commonStyles.row}>
							<View style={commonStyles.leftContainer}>
								<Text style={commonStyles.label}>Quantity</Text>
							</View>

							<View style={commonStyles.inputInlineWrapper}>
								<TextInput
									value={quantity}
									onChangeText={setQuantity}
									keyboardType="numeric"
									placeholderTextColor={colors.placeholder}
									style={commonStyles.input}
								/>
							</View>
						</View>

						<View style={styles.mealRow}>
							<Text style={commonStyles.label}>Meal</Text>

							<View style={styles.mealOptionGroup}>
								{MEAL_TYPE.map((option) => (
									<Pressable
										key={option}
										onPress={() => setMealType(option)}
										style={[
											commonStyles.optionPill,
											mealType === option
												? commonStyles.optionPillSelected
												: commonStyles.optionPillUnselected,
										]}
									>
										<Text
											style={
												mealType === option
													? commonStyles.optionPillTextSelected
													: commonStyles.optionPillTextUnselected
											}
										>
											{option}
										</Text>
									</Pressable>
								))}
							</View>
						</View>
					</View>
				</View>

				<View style={commonStyles.menuContainer}>
					<Text style={commonStyles.sectionHeading}>Date</Text>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Date</Text>
						</View>

						<Pressable
							style={commonStyles.dropdownTrigger}
							onPress={() => setDatePickerVisible(true)}
						>
							<Text style={commonStyles.dropdownTriggerText}>{date}</Text>
							<Ionicons
								name="chevron-down"
								size={14}
								color={colors.textSecondary}
							/>
						</Pressable>
					</View>
				</View>

				<TouchableOpacity
					onPress={handleLog}
					disabled={saving}
					style={commonStyles.submitButton}
				>
					<Text style={commonStyles.submitButtonText}>
						{saving ? "Saving..." : "Log food"}
					</Text>
				</TouchableOpacity>

				<DatePickerModal
					visible={datePickerVisible}
					title="Select Date"
					value={parseISODate(date)}
					onChange={(date) => setDate(formatDateToISO(date))}
					onClose={() => setDatePickerVisible(false)}
				/>
			</ScrollView>
		);
	}

	//  Step 1: search + pick a food
	return (
		<ScrollView
			style={commonStyles.container}
			bounces={false}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.headingRow}>
				<View style={styles.headingRow}>
					<Text style={[commonStyles.heading, styles.headingInRow]}>
						What did you eat?
					</Text>

					<TouchableOpacity
						style={styles.createFoodButton}
						onPress={() => router.push("/(tabs)/log/create-food")}
					>
						<Ionicons
							name="add-circle-outline"
							size={20}
							color={colors.primary}
						/>

						<Text style={styles.createFoodText}>Create Food</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={commonStyles.menuContainer}>
				<TextInput
					value={search}
					onChangeText={handleSearch}
					placeholder="Search foods..."
					placeholderTextColor={colors.placeholder}
					style={commonStyles.searchInput}
				/>

				<View style={styles.tabHeader}>
					<View style={styles.tabs}>
						<Pressable
							style={[styles.tab, activeTab === "recent" && styles.activeTab]}
							onPress={() => {
								setActiveTab("recent");
								setSearch("");
							}}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === "recent" && styles.activeTabText,
								]}
							>
								Recent
							</Text>
						</Pressable>

						<Pressable
							style={[styles.tab, activeTab === "my" && styles.activeTab]}
							onPress={() => {
								setActiveTab("my");
								setSearch("");
							}}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === "my" && styles.activeTabText,
								]}
							>
								My Foods
							</Text>
						</Pressable>
					</View>
				</View>
			</View>

			<View style={commonStyles.menuContainer}>
				{listLoading ? (
					<Text style={commonStyles.cardText}>Loading foods...</Text>
				) : (
					<FlatList
						data={displayedFoods}
						keyExtractor={(item, index) => item.id ?? `${item.name}-${index}`}
						scrollEnabled={false}
						renderItem={({ item, index }) => (
							<TouchableOpacity
								onPress={() => setSelected(item)}
								style={[
									commonStyles.listRow,
									...edgeItemStyle(index, displayedFoods.length),
								]}
							>
								<Ionicons
									name="restaurant"
									size={18}
									color={colors.textSecondary}
									style={styles.resultIcon}
								/>

								<View style={styles.resultTextContainer}>
									<Text
										style={styles.resultName}
										numberOfLines={1}
									>
										{item.name}
									</Text>

									{item.brands && item.brands.length > 0 && (
										<Text
											style={styles.resultBrand}
											numberOfLines={1}
										>
											{item.brands.join(", ")}
										</Text>
									)}

									<Text style={styles.resultSubtitle}>
										{Math.round(item.calories)} cal ·{" "}
										{Math.round(item.proteinG)}g protein{" "}
										{item.servingSize ? `/ Per ${item.servingSize}` : null}
									</Text>
								</View>

								<Ionicons
									name="chevron-forward"
									size={18}
									color="#ccc"
								/>
							</TouchableOpacity>
						)}
						ListEmptyComponent={
							<Text style={commonStyles.cardText}>
								{isSearching
									? "No results"
									: activeTab === "recent"
										? "No recent foods"
										: "No saved foods"}
							</Text>
						}
					/>
				)}
			</View>
		</ScrollView>
	);
}

function MacroCard({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<View style={styles.macroCard}>
			<Text style={styles.macroValue}>{value}</Text>
			<Text style={styles.macroLabel}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	mealRow: {
		...rowLayout,
		flexDirection: "column",
		alignItems: "stretch",
		gap: 8,
	},
	mealOptionGroup: {
		flexDirection: "row",
		gap: 10,
	},
	macroCard: {
		flex: 1,
		backgroundColor: colors.card,
		borderRadius: 8,
		paddingVertical: 10,
		alignItems: "center",
	},
	macroCardsRow: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 16,
	},
	macroValue: {
		fontSize: 15,
		fontWeight: "600",
	},
	macroLabel: {
		fontSize: 10,
		color: colors.textSecondary,
	},
	resultIcon: {
		marginRight: 10,
	},
	resultTextContainer: {
		flex: 1,
	},
	resultName: {
		fontSize: 14,
		fontWeight: "500",
	},
	resultSubtitle: {
		fontSize: 12,
		color: colors.textSecondary,
	},
	resultBrand: {
		fontSize: 12,
		color: colors.textSecondary,
	},

	tabs: {
		flexDirection: "row",
		marginTop: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5EA",
	},

	tab: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 10,
		borderBottomWidth: 2,
		borderBottomColor: "transparent",
	},

	activeTab: {
		borderBottomColor: colors.primary,
	},

	tabText: {
		fontSize: 14,
		color: colors.textSecondary,
		fontWeight: "500",
	},

	activeTabText: {
		color: colors.primary,
		fontWeight: "600",
	},

	tabHeader: {
		gap: 10,
	},

	headingRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 16,
	},

	headingInRow: {
		marginBottom: 0,
		flex: 1,
	},

	createFoodButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},

	createFoodText: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.primary,
	},
});
