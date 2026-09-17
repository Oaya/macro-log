import { gql, TypedDocumentNode } from "@apollo/client";
import { UnitPreference } from "./user";

export type WeightEntry = {
	id: string;
	weightKg: number;
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
