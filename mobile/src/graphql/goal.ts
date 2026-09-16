import { gql, TypedDocumentNode } from "@apollo/client";

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
		activityLevel: string;
	} | null;
	me: {
		id: string;
		unitPreference: string;
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
		activityLevel: string;
	};
};

type SetWeightGoalVariables = {
	startWeightKg: number;
	targetWeightKg: number;
	targetDate: string;
	activityLevel: string;
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
