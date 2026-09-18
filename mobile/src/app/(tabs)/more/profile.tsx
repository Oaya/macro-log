import { DatePickerModal } from "@/components/date-picker-modal";
import {
	ME_PROFILE,
	MeProfileData,
	SEX,
	Sex,
	UnitPreference,
	UPDATE_PROFILE,
} from "@/graphql/user";
import { formatDateToISO, parseISODate } from "@/lib/date";
import { cmToDisplayHeight } from "@/lib/units";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { profileStyles } from "@/styles/profile";
import { useMutation, useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Height is always stored/sent as centimeters; only the dropdown's display differs by unit.
const CM_MIN = 100;
const CM_MAX = 250;
const DEFAULT_CM = 170;

const parseHeightCm = (value: string | null) => {
	const parsed = value ? parseFloat(value) : NaN;
	if (isNaN(parsed)) return DEFAULT_CM;
	return Math.min(Math.max(Math.round(parsed), CM_MIN), CM_MAX);
};

type HeightOption = { label: string; cm: number };

const METRIC_HEIGHT_OPTIONS: HeightOption[] = Array.from(
	{ length: CM_MAX - CM_MIN + 1 },
	(_, i) => {
		const cm = CM_MIN + i;
		return { label: `${cm} cm`, cm };
	},
);

const IMPERIAL_HEIGHT_OPTIONS: HeightOption[] = Array.from(
	{ length: (8 - 3 + 1) * 12 },
	(_, i) => {
		const totalInches = i + 3 * 12;
		const feet = Math.floor(totalInches / 12);
		const inches = totalInches % 12;
		return {
			label: `${feet}'${inches}"`,
			cm: Math.round(totalInches * 2.54),
		};
	},
);

const findNearestOptionIndex = (options: HeightOption[], cm: number) => {
	let nearestIndex = 0;
	let smallestDiff = Infinity;
	options.forEach((option, index) => {
		const diff = Math.abs(option.cm - cm);
		if (diff < smallestDiff) {
			smallestDiff = diff;
			nearestIndex = index;
		}
	});
	return nearestIndex;
};

export function getNavOptions() {
	return { title: "" };
}

export default function Profile() {
	const { data: meData, loading, error } = useQuery(ME_PROFILE);
	const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE, {
		refetchQueries: [{ query: ME_PROFILE }],
	});

	// Local State Management for Editing
	const [isEditing, setIsEditing] = useState(false);
	const [sex, setSex] = useState<Sex | null>(null);
	const [dob, setDob] = useState<string | null>(null);
	const [height, setHeight] = useState<string | null>("");
	const [unit, setUnit] = useState<UnitPreference>("METRIC");
	const [heightPickerVisible, setHeightPickerVisible] = useState(false);
	const [dobPickerVisible, setDobPickerVisible] = useState(false);
	const [initializedMe, setInitializedMe] = useState<
		MeProfileData["me"] | null
	>(null);

	// Initialize local state when Apollo data loads
	if (meData?.me && meData.me !== initializedMe) {
		setInitializedMe(meData.me);
		setSex(meData.me.sex);
		setDob(meData.me.dateOfBirth);
		setHeight(String(meData.me.heightCm));
		setUnit(meData.me.unitPreference);
	}

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

	const isImperial = unit?.toUpperCase() === "IMPERIAL";

	//  Save and Cancel Handlers
	const handleSave = async () => {
		try {
			await updateProfile({
				variables: {
					dateOfBirth: dob,
					heightCm: height ? parseHeightCm(height) : null,
					sex: sex,
					unitPreference: unit,
				},
			});
			setIsEditing(false);
			Alert.alert("Success", "Profile updated successfully!");
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to update profile.");
		}
	};

	const handleCancel = () => {
		if (meData?.me) {
			setDob(meData.me.dateOfBirth);
			setSex(meData?.me.sex);
			setDob(meData.me.dateOfBirth);
			setHeight(String(meData.me.heightCm));
			setUnit(meData.me.unitPreference);
		}
		setIsEditing(false);
	};

	const heightOptions = isImperial
		? IMPERIAL_HEIGHT_OPTIONS
		: METRIC_HEIGHT_OPTIONS;

	const selectedHeightIndex = findNearestOptionIndex(
		heightOptions,
		parseHeightCm(height),
	);

	const avatarUri =
		meData?.me.sex === "FEMALE"
			? "https://plus.unsplash.com/premium_photo-1739786996040-32bde1db0610?w=500&auto=format&fit=crop&q=60"
			: meData?.me.sex === "MALE"
				? "https://images.unsplash.com/photo-1740252117070-7aa2955b25f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D"
				: "https://images.unsplash.com/photo-1655650876411-baf437280c44?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQyfHx8ZW58MHx8fHx8";

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
				<View style={profileStyles.avatarBlock}>
					<Image
						source={{
							uri: avatarUri,
						}}
						style={profileStyles.avatar}
					/>
					<Text style={profileStyles.name}>{meData?.me.username}</Text>
					<Text style={profileStyles.joined}>
						Member since{" "}
						{meData?.me.createdAt
							? new Date(meData.me.createdAt).toISOString().split("T")[0]
							: "--"}
					</Text>
				</View>

				<View style={profileStyles.detailsCard}>
					{/* Email Row */}
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Email</Text>
						</View>

						<Text
							style={commonStyles.value}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{meData?.me.email}
						</Text>
					</View>

					{/* Date of Birth Row */}
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Date of Birth</Text>
						</View>
						{isEditing ? (
							<Pressable
								style={commonStyles.dropdownTrigger}
								onPress={() => setDobPickerVisible(true)}
							>
								<Text style={commonStyles.dropdownTriggerText}>
									{dob || "--"}
								</Text>
								<Ionicons
									name="chevron-down"
									size={14}
									color={colors.textSecondary}
								/>
							</Pressable>
						) : (
							<Text
								style={commonStyles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{meData?.me.dateOfBirth || "--"}
							</Text>
						)}
					</View>

					{/* Height Row */}
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Height</Text>
						</View>
						{isEditing ? (
							<Pressable
								style={commonStyles.dropdownTrigger}
								onPress={() => setHeightPickerVisible(true)}
							>
								<Text style={commonStyles.dropdownTriggerText}>
									{heightOptions[selectedHeightIndex]?.label ?? "--"}
								</Text>
								<Ionicons
									name="chevron-down"
									size={14}
									color={colors.textSecondary}
								/>
							</Pressable>
						) : (
							<Text
								style={commonStyles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{height
									? (cmToDisplayHeight(height, isImperial) ?? "--")
									: "--"}
							</Text>
						)}
					</View>

					{/* Sex Row */}
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Sex</Text>
						</View>
						{isEditing ? (
							<View style={profileStyles.optionGroup}>
								{SEX.map((option) => (
									<Pressable
										key={option}
										onPress={() => setSex(option)}
										style={[
											commonStyles.optionPill,
											sex === option
												? profileStyles.pillSelected
												: profileStyles.pillUnselected,
										]}
									>
										<Text
											style={
												sex === option
													? profileStyles.pillTextSelected
													: profileStyles.pillTextUnselected
											}
										>
											{option}
										</Text>
									</Pressable>
								))}
							</View>
						) : (
							<Text
								style={commonStyles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{meData?.me.sex || "--"}
							</Text>
						)}
					</View>

					{/* Unit Preference Row */}
					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<Text style={commonStyles.label}>Unit Preference</Text>
						</View>
						{isEditing ? (
							<View style={profileStyles.optionGroup}>
								{(["METRIC", "IMPERIAL"] as const).map((option) => (
									<Pressable
										key={option}
										onPress={() => setUnit(option)}
										style={[
											commonStyles.optionPill,
											unit === option
												? profileStyles.pillSelected
												: profileStyles.pillUnselected,
										]}
									>
										<Text
											style={
												unit === option
													? profileStyles.pillTextSelected
													: profileStyles.pillTextUnselected
											}
										>
											{option}
										</Text>
									</Pressable>
								))}
							</View>
						) : (
							<Text
								style={commonStyles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{meData?.me.unitPreference}
							</Text>
						)}
					</View>
				</View>

				{/*  Dynamic Footer Action Layout */}
				{isEditing ? (
					<View style={commonStyles.submitActionsContainer}>
						<TouchableOpacity
							style={[commonStyles.actionButton, commonStyles.cancelButton]}
							onPress={handleCancel}
						>
							<Text style={commonStyles.cancelButtonText}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[commonStyles.actionButton, commonStyles.saveButton]}
							onPress={handleSave}
							disabled={updating}
						>
							{updating ? (
								<ActivityIndicator
									color="#FFF"
									size="small"
								/>
							) : (
								<Text style={commonStyles.saveButtonText}>Save</Text>
							)}
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						style={commonStyles.submitButton}
						onPress={() => setIsEditing(true)}
					>
						<Text style={commonStyles.submitButtonText}>Edit Profile</Text>
					</TouchableOpacity>
				)}
			</ScrollView>

			<Modal
				visible={heightPickerVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setHeightPickerVisible(false)}
			>
				<Pressable
					style={commonStyles.modalBackdrop}
					onPress={() => setHeightPickerVisible(false)}
				>
					<Pressable
						style={commonStyles.modalSheet}
						onPress={() => {}}
					>
						<View style={commonStyles.modalHeader}>
							<Text style={commonStyles.modalTitle}>Select Height</Text>
							<TouchableOpacity onPress={() => setHeightPickerVisible(false)}>
								<Text style={commonStyles.modalDoneText}>Done</Text>
							</TouchableOpacity>
						</View>
						<FlatList
							data={heightOptions}
							keyExtractor={(item) => item.label}
							initialScrollIndex={selectedHeightIndex}
							getItemLayout={(_, index) => ({
								length: 44,
								offset: 44 * index,
								index,
							})}
							renderItem={({ item, index }) => (
								<TouchableOpacity
									style={commonStyles.modalOptionRow}
									onPress={() => {
										setHeight(String(item.cm));
										setHeightPickerVisible(false);
									}}
								>
									<Text
										style={[
											commonStyles.modalOptionText,
											index === selectedHeightIndex &&
												commonStyles.modalOptionTextSelected,
										]}
									>
										{item.label}
									</Text>
								</TouchableOpacity>
							)}
						/>
					</Pressable>
				</Pressable>
			</Modal>

			<DatePickerModal
				visible={dobPickerVisible}
				title="Select Date of Birth"
				value={parseISODate(dob)}
				maximumDate={new Date()}
				onChange={(date) => setDob(formatDateToISO(date))}
				onClose={() => setDobPickerVisible(false)}
			/>
		</KeyboardAvoidingView>
	);
}
