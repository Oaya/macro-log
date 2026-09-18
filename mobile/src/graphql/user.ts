import { gql, TypedDocumentNode } from "@apollo/client";

export const UNIT_PREFERENCE = ["METRIC", "IMPERIAL"] as const;
export type UnitPreference = (typeof UNIT_PREFERENCE)[number];

export const SEX = ["MALE", "FEMALE"] as const;
export type Sex = (typeof SEX)[number];

export type MeAccountData = {
	me: { id: string; email: string; username: string };
};

export const ME_ACCOUNT: TypedDocumentNode<MeAccountData> = gql`
	query {
		me {
			id
			email
			username
		}
	}
`;

export type MeWeightData = {
	me: { id: string; unitPreference: UnitPreference };
	todayBodyStats: {
		weightKg: number | null;
		waistCm: number | null;
		hipCm: number | null;
		chestCm: number | null;
		armCm: number | null;
		thighCm: number | null;
		recordedDate: string;
	} | null;
};

export type MeWeightVariables = { date: string };

export const ME_WEIGHT: TypedDocumentNode<MeWeightData, MeWeightVariables> = gql`
	query MeWeight($date: Date!) {
		me {
			id
			unitPreference
		}
		todayBodyStats(recordedDate: $date) {
			weightKg
			waistCm
			hipCm
			chestCm
			armCm
			thighCm
			recordedDate
		}
	}
`;

export type BodyStatsEntry = {
	id: string;
	weightKg: number | null;
	waistCm: number | null;
	hipCm: number | null;
	chestCm: number | null;
	armCm: number | null;
	thighCm: number | null;
	recordedDate: string;
};

export type BodyStatsHistoryData = {
	bodyWeights: Omit<BodyStatsEntry, "id">[];
};

// Ordered newest-first by the backend, so the first non-null match for a
// field is the most recent prior value — used to placeholder a blank field
// with the last known measurement.
export const BODY_STATS_HISTORY: TypedDocumentNode<BodyStatsHistoryData> = gql`
	query BodyStatsHistory {
		bodyWeights {
			weightKg
			waistCm
			hipCm
			chestCm
			armCm
			thighCm
			recordedDate
		}
	}
`;

export type BodyStatsForDateData = {
	me: { id: string; unitPreference: UnitPreference };
	bodyWeights: BodyStatsEntry[];
};

export type BodyStatsForDateVariables = { recordedDate: string };

export const BODY_STATS_FOR_DATE: TypedDocumentNode<
	BodyStatsForDateData,
	BodyStatsForDateVariables
> = gql`
	query BodyStatsForDate($recordedDate: Date!) {
		me {
			id
			unitPreference
		}
		bodyWeights(recordedDate: $recordedDate) {
			id
			weightKg
			waistCm
			hipCm
			chestCm
			armCm
			thighCm
			recordedDate
		}
	}
`;

export const RECORD_BODY_STATS = gql`
	mutation RecordBodyStats(
		$weightKg: Float
		$waistCm: Float
		$hipCm: Float
		$chestCm: Float
		$armCm: Float
		$thighCm: Float
		$recordedDate: Date
	) {
		recordBodyStats(
			weightKg: $weightKg
			waistCm: $waistCm
			hipCm: $hipCm
			chestCm: $chestCm
			armCm: $armCm
			thighCm: $thighCm
			recordedDate: $recordedDate
		) {
			weightKg
			waistCm
			hipCm
			chestCm
			armCm
			thighCm
			recordedDate
		}
	}
`;

export type MeProfileData = {
	me: {
		id: string;
		email: string;
		username: string;
		createdAt: string;
		heightCm: number | null;
		dateOfBirth: string | null;
		sex: Sex | null;
		unitPreference: UnitPreference;
	};
};

export const ME_PROFILE: TypedDocumentNode<MeProfileData> = gql`
	query GetMe {
		me {
			id
			email
			username
			createdAt
			heightCm
			dateOfBirth
			sex
			unitPreference
		}
	}
`;

export const UPDATE_PROFILE = gql`
	mutation UpdateProfile(
		$heightCm: Float
		$sex: Sex
		$dateOfBirth: Date
		$unitPreference: UnitPreference
	) {
		updateProfile(
			heightCm: $heightCm
			sex: $sex
			dateOfBirth: $dateOfBirth
			unitPreference: $unitPreference
		) {
			heightCm
			dateOfBirth
			sex
			unitPreference
		}
	}
`;

type DeleteBodyWeightData = { deleteBodyWeight: boolean };
type DeleteBodyWeightVariables = { id: string };

export const DELETE_BODY_WEIGHT: TypedDocumentNode<
	DeleteBodyWeightData,
	DeleteBodyWeightVariables
> = gql`
	mutation DeleteBodyWeight($id: ID!) {
		deleteBodyWeight(id: $id)
	}
`;
