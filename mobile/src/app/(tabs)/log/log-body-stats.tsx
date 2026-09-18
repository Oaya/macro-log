import { DatePickerModal } from "@/components/date-picker-modal";
import {
	BODY_STATS_FOR_DATE,
	BODY_STATS_HISTORY,
	BodyStatsEntry,
	ME_WEIGHT,
	RECORD_BODY_STATS,
} from "@/graphql/user";
import { formatDateToISO, parseISODate } from "@/lib/date";
import {
	cmToDisplayLength,
	displayLengthToCm,
	displayWeightToKg,
	kgToDisplayWeight,
} from "@/lib/units";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { TextInput } from "@/components/text-input";
import { useMutation, useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function LogBodyStats() {
	// Coming from a tap on a Progress history row means we're editing that
	// day's entry rather than logging a fresh one for today.
	const { date: editDate } = useLocalSearchParams<{ date?: string }>();
	const isEditing = typeof editDate === "string";

	const [recordBodyStats, { loading: creating }] = useMutation(
		RECORD_BODY_STATS,
		{
			refetchQueries: ["HomeData", "ProgressData", "BodyStatsForDate"],
		},
	);
	const today = formatDateToISO(new Date());
	const { data: meData, loading, error, refetch } = useQuery(ME_WEIGHT, {
		variables: { date: today },
		skip: isEditing,
	});
	const {
		data: dateData,
		loading: dateLoading,
		error: dateError,
		refetch: refetchDate,
	} = useQuery(BODY_STATS_FOR_DATE, {
		variables: { recordedDate: editDate ?? "" },
		skip: !isEditing,
	});
	const { data: historyData } = useQuery(BODY_STATS_HISTORY);

	const [datePickerVisible, setDatePickerVisible] = useState(false);

	const [weight, setWeight] = useState("");
	const [waist, setWaist] = useState("");
	const [hip, setHip] = useState("");
	const [chest, setChest] = useState("");
	const [arm, setArm] = useState("");
	const [thigh, setThigh] = useState("");

	const [date, setDate] = useState(editDate ?? today);
	const [initializedKey, setInitializedKey] = useState<string | null>(null);
	const unit = isEditing ? dateData?.me.unitPreference : meData?.me.unitPreference;

	const isImperial = unit?.toUpperCase() === "IMPERIAL";

	// Whichever entry backs this form: the specific day being edited, or
	// today's entry if one's already been logged.
	const entry = isEditing ? dateData?.bodyWeights[0] : meData?.todayBodyStats;
	const ready = isEditing ? dateData !== undefined : meData !== undefined;

	// Initialize local state from backend data.
	const initKey = ready
		? `${editDate ?? "today"}:${entry?.recordedDate ?? "none"}:${entry?.weightKg ?? "none"}:${unit}`
		: null;

	if (initKey && initKey !== initializedKey) {
		setInitializedKey(initKey);
		if (entry) {
			setWeight(kgToDisplayWeight(entry.weightKg, isImperial));
			setWaist(cmToDisplayLength(entry.waistCm, isImperial));
			setHip(cmToDisplayLength(entry.hipCm, isImperial));
			setChest(cmToDisplayLength(entry.chestCm, isImperial));
			setArm(cmToDisplayLength(entry.armCm, isImperial));
			setThigh(cmToDisplayLength(entry.thighCm, isImperial));
		}
		setDate(editDate ?? entry?.recordedDate ?? today);
	}

	// history is newest-first, so the first entry strictly before the
	// selected date with a non-null value for this field is the most recent
	// known measurement — shown as a placeholder when the field is blank.
	const placeholderFor = (
		field: keyof Omit<BodyStatsEntry, "id" | "recordedDate">,
	) => {
		const prior = historyData?.bodyWeights.find(
			(e) => e.recordedDate < date && e[field] != null,
		);
		if (!prior) return undefined;
		return field === "weightKg"
			? kgToDisplayWeight(prior.weightKg, isImperial)
			: cmToDisplayLength(prior[field], isImperial);
	};

	const handleSave = async () => {
		try {
			await recordBodyStats({
				variables: {
					weightKg: displayWeightToKg(weight, isImperial),
					waistCm: displayLengthToCm(waist, isImperial),
					hipCm: displayLengthToCm(hip, isImperial),
					chestCm: displayLengthToCm(chest, isImperial),
					armCm: displayLengthToCm(arm, isImperial),
					thighCm: displayLengthToCm(thigh, isImperial),
					recordedDate: date,
				},
			});
			await (isEditing ? refetchDate() : refetch());
			Alert.alert(
				"Saved",
				isEditing
					? `Body stats updated for ${date}`
					: "Body stats recorded for today",
			);
		} catch (e: any) {
			Alert.alert("Error", e.message);
		}
	};

	if (isEditing ? dateLoading : loading) {
		return (
			<View style={commonStyles.loadingContainer}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 8 }}>Loading...</Text>
			</View>
		);
	}

	const loadError = isEditing ? dateError : error;
	if (loadError) {
		return (
			<View style={commonStyles.errorContainer}>
				<Text style={commonStyles.errorText}>Error: {loadError.message}</Text>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={commonStyles.logRowTextContainer}
		>
			<ScrollView
				style={commonStyles.container}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<Text style={commonStyles.heading}>
					{isEditing ? `Edit Body Stats — ${date}` : "Record Your Body Stats"}
				</Text>

				<View
					style={[
						commonStyles.menuContainer,
						commonStyles.menuItemFirst,
						commonStyles.menuItemLast,
					]}
				>
					<Text style={commonStyles.sectionHeading}>Body measurement</Text>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Weight</Text>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								style={commonStyles.input}
								value={weight}
								placeholder={placeholderFor("weightKg")}
								keyboardType="decimal-pad"
								placeholderTextColor={colors.placeholder}
								onChangeText={setWeight}
							/>

							<Text style={commonStyles.inputSuffix}>
								{isImperial ? "lb" : "kg"}
							</Text>
						</View>
					</View>
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Waist</Text>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								style={commonStyles.input}
								value={waist}
								placeholder={placeholderFor("waistCm")}
								keyboardType="decimal-pad"
								placeholderTextColor={colors.placeholder}
								onChangeText={setWaist}
							/>

							<Text style={commonStyles.inputSuffix}>
								{isImperial ? "in" : "cm"}
							</Text>
						</View>
					</View>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Hip</Text>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								style={commonStyles.input}
								value={hip}
								placeholder={placeholderFor("hipCm")}
								keyboardType="decimal-pad"
								placeholderTextColor={colors.placeholder}
								onChangeText={setHip}
							/>

							<Text style={commonStyles.inputSuffix}>
								{isImperial ? "in" : "cm"}
							</Text>
						</View>
					</View>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Chest</Text>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								style={commonStyles.input}
								value={chest}
								placeholder={placeholderFor("chestCm")}
								keyboardType="decimal-pad"
								placeholderTextColor={colors.placeholder}
								onChangeText={setChest}
							/>

							<Text style={commonStyles.inputSuffix}>
								{isImperial ? "in" : "cm"}
							</Text>
						</View>
					</View>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Arm</Text>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								style={commonStyles.input}
								value={arm}
								placeholder={placeholderFor("armCm")}
								keyboardType="decimal-pad"
								placeholderTextColor={colors.placeholder}
								onChangeText={setArm}
							/>

							<Text style={commonStyles.inputSuffix}>
								{isImperial ? "in" : "cm"}
							</Text>
						</View>
					</View>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Thigh</Text>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								style={commonStyles.input}
								value={thigh}
								placeholder={placeholderFor("thighCm")}
								keyboardType="decimal-pad"
								placeholderTextColor={colors.placeholder}
								onChangeText={setThigh}
							/>

							<Text style={commonStyles.inputSuffix}>
								{isImperial ? "in" : "cm"}
							</Text>
						</View>
					</View>
				</View>

				<View
					style={[
						commonStyles.menuContainer,
						commonStyles.menuItemFirst,
						commonStyles.menuItemLast,
					]}
				>
					<Text style={commonStyles.sectionHeading}>Date</Text>

					<View style={commonStyles.row}>
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
								color={colors.textSecondary}
							/>
						</Pressable>
					</View>
				</View>

				<TouchableOpacity
					style={commonStyles.submitButton}
					onPress={handleSave}
					disabled={creating}
				>
					<Text style={commonStyles.submitButtonText}>
						{creating ? "Saving..." : isEditing ? "Update Body Stats" : "Record Body Stats"}
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
