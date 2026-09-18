import { gql, TypedDocumentNode } from "@apollo/client";
import { UnitPreference } from "./user";

export type WeightEntry = {
	id: string;
	weightKg: number | null;
	waistCm: number | null;
	hipCm: number | null;
	chestCm: number | null;
	armCm: number | null;
	thighCm: number | null;
	recordedDate: string;
};

export type ProgressData = {
	bodyWeights: WeightEntry[];
	me: {
		unitPreference: UnitPreference;
	};
	goal: {
		dailyCalories: number;
		proteinG: number;
		carbsG: number;
		fatG: number;
	} | null;
};

export const PROGRESS_DATA: TypedDocumentNode<ProgressData> = gql`
	query ProgressData {
		bodyWeights {
			id
			weightKg
			waistCm
			hipCm
			chestCm
			armCm
			thighCm
			recordedDate
		}
		me {
			unitPreference
		}
		goal {
			dailyCalories
			proteinG
			carbsG
			fatG
		}
	}
`;
