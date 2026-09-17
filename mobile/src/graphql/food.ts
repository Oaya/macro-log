import { gql, TypedDocumentNode } from "@apollo/client";

export const SOURCE = ["YOUR_FOODS", "DATABASE", "RECENT"] as const;
export type Source = (typeof SOURCE)[number];

export const MEAL_TYPE = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;
export type MealType = (typeof MEAL_TYPE)[number];

export type FoodResult = {
	name: string;
	brands: string[] | null;
	id: string | null;
	calories: number;
	proteinG: number;
	carbsG: number;
	fatG: number;
	fiberG: number | null;
	sodiumMg: number | null;
	source: Source;
	servingSize: string | null;
};

const FOOD_RESULT_FIELDS = gql`
	fragment FoodResultFields on FoodSearchResult {
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
`;

type SearchData = { searchFoods: FoodResult[] };

export const SEARCH_FOODS: TypedDocumentNode<SearchData, { query: string }> =
	gql`
		query SearchFoods($query: String!) {
			searchFoods(query: $query, limit: 100) {
				...FoodResultFields
			}
		}
		${FOOD_RESULT_FIELDS}
	`;

type RecentFoodsData = {
	recentFoods: FoodResult[];
};

export const RECENT_FOODS: TypedDocumentNode<RecentFoodsData> = gql`
	query RecentFoods {
		recentFoods(limit: 100) {
			...FoodResultFields
		}
	}
	${FOOD_RESULT_FIELDS}
`;

type MyFoodsData = {
	myFoods: FoodResult[];
};

export const MY_FOODS: TypedDocumentNode<MyFoodsData> = gql`
	query MyFoods {
		myFoods(limit: 100) {
			...FoodResultFields
		}
	}
	${FOOD_RESULT_FIELDS}
`;

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
	mealType: MealType;
	logDate: string;
};

export const LOG_FOOD: TypedDocumentNode<LogFoodData, LogFoodVariables> = gql`
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

type CreateFoodData = {
	createFood: FoodResult;
};
type CreateFoodVariables = {
	name: string;
	servingSize: string | null;
	calories: number;
	proteinG: number;
	carbsG: number;
	fatG: number;
	fiberG: number | null;
	sodiumMg: number | null;
};

type DeleteFoodLogData = { deleteFoodLog: boolean };
type DeleteFoodLogVariables = { id: string };

export const DELETE_FOOD_LOG: TypedDocumentNode<
	DeleteFoodLogData,
	DeleteFoodLogVariables
> = gql`
	mutation DeleteFoodLog($id: ID!) {
		deleteFoodLog(id: $id)
	}
`;

export const CREATE_FOOD: TypedDocumentNode<
	CreateFoodData,
	CreateFoodVariables
> = gql`
	mutation CreateFood(
		$name: String!
		$servingSize: String!
		$calories: Float!
		$proteinG: Float!
		$carbsG: Float!
		$fatG: Float!
		$fiberG: Float
		$sodiumMg: Float
	) {
		createFood(
			name: $name
			calories: $calories
			servingSize: $servingSize
			proteinG: $proteinG
			carbsG: $carbsG
			fatG: $fatG
			fiberG: $fiberG
			sodiumMg: $sodiumMg
		) {
			...FoodResultFields
		}
	}
	${FOOD_RESULT_FIELDS}
`;
