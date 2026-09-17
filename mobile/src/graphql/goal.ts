import { gql, TypedDocumentNode } from "@apollo/client";
import { UnitPreference } from "./user";

export const ACTIVITY_LEVEL = [
	"SEDENTARY",
	"LIGHT",
	"MODERATE",
	"ACTIVE",
] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVEL)[number];

export type GoalData = {
	goal: {
		id: string;
		dailyCalories: number;
		proteinG: number;
		fatG: number;
		carbsG: number;
		startWeightKg: number | null;
		targetWeightKg: number | null;
		targetDate: string | null;
		activityLevel: ActivityLevel;
	} | null;
	me: {
		id: string;
		unitPreference: UnitPreference;
	};
};

export const GOAL: TypedDocumentNode<GoalData> = gql`
	query GetGoal {
		goal {
			dailyCalories
			proteinG
			fatG
			carbsG
			startWeightKg
			targetWeightKg
			targetDate
			activityLevel
		}
		me {
			id
			unitPreference
		}
	}
`;

type SetWeightGoalData = {
	setWeightGoal: {
		startWeightKg: number;
		targetWeightKg: number;
		targetDate: string;
		activityLevel: ActivityLevel;
	};
};

type SetWeightGoalVariables = {
	startWeightKg: number;
	targetWeightKg: number;
	targetDate: string;
	activityLevel: ActivityLevel;
};

export const SET_WEIGHT_GOAL: TypedDocumentNode<
	SetWeightGoalData,
	SetWeightGoalVariables
> = gql`
	mutation SetWeightGoal(
		$startWeightKg: Float!
		$targetWeightKg: Float!
		$targetDate: Date!
		$activityLevel: String!
	) {
		setWeightGoal(
			startWeightKg: $startWeightKg
			targetWeightKg: $targetWeightKg
			targetDate: $targetDate
			activityLevel: $activityLevel
		) {
			startWeightKg
			targetWeightKg
			targetDate
			activityLevel
		}
	}
`;
