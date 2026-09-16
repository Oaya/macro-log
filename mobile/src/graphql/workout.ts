import { gql, TypedDocumentNode } from "@apollo/client";

export type Exercise = {
	id: string;
	name: string;
	type: string;
	metValue: number | null;
};
type ExercisesData = { exercises: Exercise[] };

export const EXERCISES: TypedDocumentNode<ExercisesData> = gql`
	query {
		exercises {
			id
			name
			type
			metValue
		}
	}
`;

type LogWorkoutData = {
	logWorkout: { exerciseName: string; caloriesBurned: number | null };
};
type LogWorkoutVariables = {
	exerciseId: string;
	sets: number | null;
	reps: number | null;
	weight: number | null;
	weightType: string | null;
	durationMin: number | null;
	logDate: string;
};

export const LOG_WORKOUT: TypedDocumentNode<
	LogWorkoutData,
	LogWorkoutVariables
> = gql`
	mutation LogWorkout(
		$exerciseId: ID!
		$sets: Int
		$reps: Int
		$weight: Float
		$weightType: String
		$durationMin: Int
		$logDate: Date
	) {
		logWorkout(
			exerciseId: $exerciseId
			sets: $sets
			reps: $reps
			weight: $weight
			weightType: $weightType
			durationMin: $durationMin
			logDate: $logDate
		) {
			exerciseName
			caloriesBurned
		}
	}
`;
