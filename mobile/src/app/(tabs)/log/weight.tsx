import { DatePickerModal } from "@/components/date-picker-modal";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { displayWeightToKg } from "@/lib/units";
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
	const { data: meData, loading, error } = useQuery(ME);

	console.log(meData);

	const [datePickerVisible, setDatePickerVisible] = useState(false);

	const [weight, setWeight] = useState("");
	const [date, setDate] = useState(formatDateToISO(new Date()));

	const unit = meData?.me.unitPreference;

	const isImperial = unit?.toUpperCase() === "IMPERIAL";

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
						color: "#FF3B30",
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
			Alert.alert("Saved", "Weight recorded for today");
			setWeight("");
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
				style={styles.container}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.detailsCard}>
					<Text style={styles.sectionHeading}>Weight</Text>

					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Weight</Text>
						</View>

						<View style={styles.inputInlineWrapper}>
							<TextInput
								style={[
									styles.input,
									{
										flex: 0,
										width: 90,
									},
								]}
								value={weight}
								keyboardType="decimal-pad"
								placeholder={isImperial ? "130.0" : "60.0"}
								placeholderTextColor="#C7C7CC"
								onChangeText={setWeight}
							/>

							<Text style={styles.inputSuffix}>{isImperial ? "lb" : "kg"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Date</Text>
						</View>

						<Pressable
							style={styles.dropdownTrigger}
							onPress={() => setDatePickerVisible(true)}
						>
							<Text style={styles.dropdownTriggerText}>{date}</Text>
							<Ionicons
								name="chevron-down"
								size={14}
								color="#8E8E93"
							/>
						</Pressable>
					</View>
				</View>

				<TouchableOpacity
					style={styles.editButton}
					onPress={handleSave}
					disabled={creating}
				>
					<Text style={styles.editButtonText}>
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
	container: {
		flex: 1,
		backgroundColor: "#F4F6F9",
		padding: 20,
	},

	detailsCard: {
		backgroundColor: "#FFF",
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 24,
	},

	sectionHeading: {
		fontSize: 12,
		fontWeight: "700",
		color: "#8E8E93",
		textTransform: "uppercase",
		marginTop: 14,
		marginBottom: 6,
	},

	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		gap: 16,
		minHeight: 56,
	},

	leftContainer: {
		flexDirection: "row",
		alignItems: "center",
	},

	label: {
		fontSize: 15,
		color: "#1A1A1A",
		fontWeight: "500",
	},

	input: {
		fontSize: 15,
		color: "#1A1A1A",
		backgroundColor: "#F4F6F9",
		borderRadius: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		textAlign: "right",
		flex: 1,
		maxWidth: "65%",
	},

	inputInlineWrapper: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		flex: 1,
	},

	inputSuffix: {
		marginLeft: 6,
		fontSize: 14,
		color: "#8E8E93",
	},

	dropdownTrigger: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},

	dropdownTriggerText: {
		fontSize: 15,
		color: "#1A1A1A",
	},

	editButton: {
		backgroundColor: "#4bb7e1",
		height: 48,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 40,
	},

	editButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#FFF",
	},
});
