import { DatePickerModal } from "@/components/date-picker-modal";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { displayWeightToKg, kgToDisplayWeight } from "@/lib/units";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type MeData = {
	me: { id: string; unitPreference: string };
	latestBodyWeight: {
		weightKg: number;
		recordedDate: string;
	};
};

const ME: TypedDocumentNode<MeData> = gql`
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

const RECORD_WEIGHT = gql`
	mutation RecordWeight($weightKg: Float!, $recordedDate: Date!) {
		recordWeight(weightKg: $weightKg, recordedDate: $recordedDate) {
			weightKg
			recordedDate
		}
	}
`;

export default function Weight() {
	const [recordWeight, { loading: creating }] = useMutation(RECORD_WEIGHT);
	const { data: meData, loading, error, refetch } = useQuery(ME);

	const [datePickerVisible, setDatePickerVisible] = useState(false);

	const [weight, setWeight] = useState("");
	const [date, setDate] = useState(formatDateToISO(new Date()));
	const [initializedWeightKey, setInitializedWeightKey] = useState<
		string | null
	>(null);
	const unit = meData?.me.unitPreference;

	const isImperial = unit?.toUpperCase() === "IMPERIAL";

	// Initialize local state from backend data.
	const weightKey = meData
		? `${meData.latestBodyWeight?.recordedDate ?? "none"}:${meData.latestBodyWeight?.weightKg ?? "none"}:${unit}`
		: null;

	if (weightKey && weightKey !== initializedWeightKey) {
		setInitializedWeightKey(weightKey);
		if (meData?.latestBodyWeight) {
			setWeight(
				kgToDisplayWeight(meData.latestBodyWeight.weightKg, isImperial),
			);
			setDate(meData.latestBodyWeight.recordedDate);
		}
	}

	if (error) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					padding: 20,
				}}
			>
				<Text
					style={{
						color: colors.danger,
						textAlign: "center",
					}}
				>
					Error: {error.message}
				</Text>
			</View>
		);
	}

	const handleSave = async () => {
		if (!weight) return Alert.alert("Enter a weight");

		const weightKg = displayWeightToKg(weight, isImperial);

		try {
			await recordWeight({
				variables: { weightKg: weightKg, recordedDate: date },
			});
			await refetch();
			Alert.alert("Saved", "Weight recorded for today");
		} catch (e: any) {
			Alert.alert("Error", e.message);
		}
	};

	if (loading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 8 }}>Loading...</Text>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
		>
			<ScrollView
				style={commonStyles.container}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<Text style={commonStyles.heading}>Record your weight</Text>

				<View style={styles.detailsCard}>
					<Text style={commonStyles.sectionHeading}>Weight</Text>

					<View style={styles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Weight</Text>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								style={[
									commonStyles.input,
									{
										flex: 0,
										width: 90,
									},
								]}
								value={weight}
								keyboardType="decimal-pad"
								placeholderTextColor="#C7C7CC"
								onChangeText={setWeight}
							/>

							<Text style={commonStyles.inputSuffix}>{isImperial ? "lb" : "kg"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Date</Text>
						</View>

						<Pressable
							style={commonStyles.dropdownTrigger}
							onPress={() => setDatePickerVisible(true)}
						>
							<Text style={commonStyles.dropdownTriggerText}>{date}</Text>
							<Ionicons
								name="chevron-down"
								size={14}
								color="#8E8E93"
							/>
						</Pressable>
					</View>
				</View>

				<TouchableOpacity
					style={commonStyles.editButton}
					onPress={handleSave}
					disabled={creating}
				>
					<Text style={commonStyles.editButtonText}>
						{creating ? "Saving..." : "Record Weight"}
					</Text>
				</TouchableOpacity>
			</ScrollView>

			<DatePickerModal
				visible={datePickerVisible}
				title="Select Date"
				value={parseISODate(date)}
				onChange={(date) => setDate(formatDateToISO(date))}
				onClose={() => setDatePickerVisible(false)}
			/>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	detailsCard: { ...commonStyles.card, marginBottom: 24 },
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		gap: 16,
		minHeight: 56,
	},
});
