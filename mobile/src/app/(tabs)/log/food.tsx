import { DatePickerModal } from "@/components/date-picker-modal";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { colors } from "@/styles/colors";
import { commonStyles, rowLayout } from "@/styles/common";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";

import {
	Alert,
	FlatList,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type FoodResult = {
	name: string;
	brands: string[] | null;
	id: string | null;
	calories: number;
	proteinG: number;
	carbsG: number;
	fatG: number;
	fiberG: number | null;
	sodiumMg: number | null;
	source: "YOUR_FOODS" | "DATABASE" | "RECENT";
	servingSize: string | null;
};
type SearchData = { searchFoods: FoodResult[] };

type RecentFoodsData = {
	recentFoods: FoodResult[];
};

type MyFoodsData = {
	myFoods: FoodResult[];
};

type LogFoodData = {
	logFood: { foodName: string; calories: number };
};
type LogFoodVariables = {
	food: {
		name: string;
		servingSize: string | null;
		calories: number;
		proteinG: number;
		carbsG: number;
		fatG: number;
		fiberG: number | null;
		sodiumMg: number | null;
	};
	quantity: number;
	mealType: (typeof MEAL_TYPES)[number];
	logDate: string;
};

const SEARCH_FOODS: TypedDocumentNode<SearchData> = gql`
	query SearchFoods($query: String!) {
		searchFoods(query: $query, limit: 100) {
			name
			brands
			id
			calories
			proteinG
			carbsG
			fatG
			fiberG
			sodiumMg
			source
			servingSize
		}
	}
`;

const RECENT_FOODS: TypedDocumentNode<RecentFoodsData> = gql`
	query RecentFoods {
		recentFoods(limit: 100) {
			id
			name
			brands
			calories
			proteinG
			carbsG
			fatG
			fiberG
			sodiumMg
			source
			servingSize
		}
	}
`;

const MY_FOODS: TypedDocumentNode<MyFoodsData> = gql`
	query MyFoods {
		myFoods(limit: 100) {
			id
			name
			brands
			calories
			proteinG
			carbsG
			fatG
			fiberG
			sodiumMg
			source
			servingSize
		}
	}
`;
const LOG_FOOD: TypedDocumentNode<LogFoodData, LogFoodVariables> = gql`
	mutation LogFood(
		$food: FoodInput!
		$quantity: Float!
		$mealType: MealType!
		$logDate: Date
	) {
		logFood(
			food: $food
			quantity: $quantity
			mealType: $mealType
			logDate: $logDate
		) {
			foodName
			calories
		}
	}
`;

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;

function defaultMealType(): (typeof MEAL_TYPES)[number] {
	const hour = new Date().getHours();
	if (hour < 11) return "BREAKFAST";
	if (hour < 16) return "LUNCH";
	if (hour < 21) return "DINNER";
	return "SNACK";
}

export default function LogFood() {
	const [activeTab, setActiveTab] = useState<"recent" | "my">("recent");
	const [runSearch, { data, loading }] = useLazyQuery(SEARCH_FOODS);
	const { data: recentData, loading: recentLoading } = useQuery(RECENT_FOODS);
	const { data: myFoodsData, loading: myFoodsLoading } = useQuery(MY_FOODS);

	const [logFood, { loading: saving }] = useMutation(LOG_FOOD);

	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<FoodResult | null>(null);

	const [datePickerVisible, setDatePickerVisible] = useState(false);
	const [date, setDate] = useState(formatDateToISO(new Date()));
	const [quantity, setQuantity] = useState("1");
	const [mealType, setMealType] =
		useState<(typeof MEAL_TYPES)[number]>(defaultMealType());

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
								{MEAL_TYPES.map((option) => (
									<Pressable
										key={option}
										onPress={() => setMealType(option)}
										style={[
											commonStyles.optionPill,
											mealType === option
												? styles.mealOptionPillSelected
												: styles.mealOptionPillUnselected,
										]}
									>
										<Text
											style={
												mealType === option
													? styles.mealOptionTextSelected
													: styles.mealOptionTextUnselected
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
				<Text style={commonStyles.heading}>What did you eat?</Text>

				<TouchableOpacity
					style={styles.createFoodButton}
					// onPress={() => router.push("/create-food")}
				>
					<Ionicons
						name="add-circle-outline"
						size={20}
						color={colors.primary}
					/>

					<Text style={styles.createFoodText}>Create Food</Text>
				</TouchableOpacity>
			</View>
			<View style={commonStyles.menuContainer}>
				<TextInput
					value={search}
					onChangeText={handleSearch}
					placeholder="Search foods..."
					placeholderTextColor={colors.placeholder}
					style={commonStyles.searchInput}
				/>

				{!isSearching && (
					<View style={styles.tabHeader}>
						<View style={styles.tabs}>
							<Pressable
								style={[styles.tab, activeTab === "recent" && styles.activeTab]}
								onPress={() => setActiveTab("recent")}
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
								onPress={() => setActiveTab("my")}
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
				)}
			</View>

			<View style={commonStyles.menuContainer}>
				{listLoading ? (
					<Text style={commonStyles.cardText}>Loading foods...</Text>
				) : (
					<FlatList
						data={displayedFoods}
						keyExtractor={(item, index) => item.id ?? `${item.name}-${index}`}
						scrollEnabled={false}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => setSelected(item)}
								style={commonStyles.row}
							>
								<Ionicons
									name="restaurant"
									size={16}
									color="#666"
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
									size={16}
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
	mealOptionPillSelected: {
		borderColor: colors.primary,
		backgroundColor: colors.primary,
	},
	mealOptionPillUnselected: {
		borderColor: "#ccc",
		backgroundColor: colors.card,
	},
	mealOptionTextSelected: {
		color: colors.card,
	},
	mealOptionTextUnselected: {
		color: colors.textPrimary,
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
		marginBottom: 12,
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
