import { gql, TypedDocumentNode } from "@apollo/client";

export type WeightEntry = {
	id: string;
	weightKg: number;
	recordedDate: string;
};

export type ProgressData = {
	bodyWeights: WeightEntry[];
	me: {
		unitPreference: string;
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
