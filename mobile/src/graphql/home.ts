import { gql, TypedDocumentNode } from "@apollo/client";
import { MealType } from "./food";
import { UnitPreference } from "./user";

export type HomeData = {
	me: {
		unitPreference: UnitPreference;
	};
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
	foodLogs: {
		id: string;
		mealType: MealType;
		foodName: string;
		calories: number;
		quantity: number;
	}[];
	workoutLogs: {
		id: string;
		exerciseName: string;
		durationMin: number | null;
		caloriesBurned: number | null;
	}[];
	bodyWeights: {
		id: string;
		weightKg: number;
	}[];
};

export const HOME_DATA: TypedDocumentNode<HomeData> = gql`
	query HomeData($date: Date!) {
		me {
			unitPreference
		}
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
		foodLogs(logDate: $date) {
			id
			mealType
			foodName
			calories
			quantity
		}
		workoutLogs(logDate: $date) {
			id
			exerciseName
			durationMin
			caloriesBurned
		}
		bodyWeights(recordedDate: $date) {
			id
			weightKg
		}
	}
`;
