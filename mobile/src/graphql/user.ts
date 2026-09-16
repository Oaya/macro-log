import { gql, TypedDocumentNode } from "@apollo/client";

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
	me: { id: string; unitPreference: string };
	latestBodyWeight: {
		weightKg: number;
		recordedDate: string;
	};
};

export const ME_WEIGHT: TypedDocumentNode<MeWeightData> = gql`
	query {
		me {
			id
			unitPreference
		}
		latestBodyWeight {
			weightKg
			recordedDate
		}
	}
`;

export const RECORD_WEIGHT = gql`
	mutation RecordWeight($weightKg: Float!, $recordedDate: Date!) {
		recordWeight(weightKg: $weightKg, recordedDate: $recordedDate) {
			weightKg
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
		sex: string | null;
		unitPreference: string;
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
