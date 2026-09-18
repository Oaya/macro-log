import { DatePickerModal } from "@/components/date-picker-modal";
import { ME_WEIGHT, RECORD_BODY_STATS } from "@/graphql/user";
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
	const [recordBodyStats, { loading: creating }] = useMutation(
		RECORD_BODY_STATS,
		{
			refetchQueries: ["HomeData"],
		},
	);
	const { data: meData, loading, error, refetch } = useQuery(ME_WEIGHT);

	const [datePickerVisible, setDatePickerVisible] = useState(false);

	const [weight, setWeight] = useState("");
	const [waist, setWaist] = useState("");
	const [hip, setHip] = useState("");
	const [chest, setChest] = useState("");
	const [arm, setArm] = useState("");
	const [thigh, setThigh] = useState("");

	const [date, setDate] = useState(formatDateToISO(new Date()));
	const [initializedWeightKey, setInitializedWeightKey] = useState<
		string | null
	>(null);
	const unit = meData?.me.unitPreference;

	const isImperial = unit?.toUpperCase() === "IMPERIAL";

	// Initialize local state from backend data.
	const weightKey = meData
		? `${meData.latestBodyStats?.recordedDate ?? "none"}:${meData.latestBodyStats?.weightKg ?? "none"}:${unit}`
		: null;

	if (weightKey && weightKey !== initializedWeightKey) {
		setInitializedWeightKey(weightKey);
		if (meData?.latestBodyStats) {
			setWeight(kgToDisplayWeight(meData.latestBodyStats.weightKg, isImperial));
			setWaist(cmToDisplayLength(meData.latestBodyStats.waistCm, isImperial));
			setHip(cmToDisplayLength(meData.latestBodyStats.hipCm, isImperial));
			setChest(cmToDisplayLength(meData.latestBodyStats.chestCm, isImperial));
			setArm(cmToDisplayLength(meData.latestBodyStats.armCm, isImperial));
			setThigh(cmToDisplayLength(meData.latestBodyStats.thighCm, isImperial));
			setDate(meData.latestBodyStats.recordedDate);
		}
	}

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
			await refetch();
			Alert.alert("Saved", "Body stats recorded for today");
		} catch (e: any) {
			Alert.alert("Error", e.message);
		}
	};

	if (loading) {
		return (
			<View style={commonStyles.loadingContainer}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 8 }}>Loading...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={commonStyles.errorContainer}>
				<Text style={commonStyles.errorText}>Error: {error.message}</Text>
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
				<Text style={commonStyles.heading}>Record Your Body Stats</Text>

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
						{creating ? "Saving..." : "Record Body Stats"}
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
