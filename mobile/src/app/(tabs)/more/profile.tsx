import { TypedDocumentNode, gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { DatePickerModal } from "@/components/date-picker-modal";
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
	StyleSheet,
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

type MeData = {
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

const ME: TypedDocumentNode<MeData> = gql`
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

const UPDATE_PROFILE = gql`
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

export default function Profile() {
	const { data: meData, loading, error } = useQuery(ME);
	const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE, {
		refetchQueries: [{ query: ME }],
	});

	// Local State Management for Editing
	const [isEditing, setIsEditing] = useState(false);
	const [sex, setSex] = useState<string | null>(null);
	const [dob, setDob] = useState<string | null>(null);
	const [height, setHeight] = useState<string | null>("");
	const [unit, setUnit] = useState<string>("METRIC");
	const [heightPickerVisible, setHeightPickerVisible] = useState(false);
	const [dobPickerVisible, setDobPickerVisible] = useState(false);
	const [initializedMe, setInitializedMe] = useState<MeData["me"] | null>(
		null,
	);

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
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 8 }}>Loading...</Text>
			</View>
		);
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
				<Text style={{ color: "#FF3B30", textAlign: "center" }}>
					Error: {error.message}
				</Text>
			</View>
		);
	}

	//  Save and Cancel Handlers
	const handleSave = async () => {
		try {
			await updateProfile({
				variables: {
					dateOfBirth: dob,
					heightCm: parseHeightCm(height),
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

	// Helper to format dynamic height labels
	const formatHeightDisplay = (heightVal: string) => {
		const cm = parseFloat(heightVal);
		if (isNaN(cm) || cm <= 0) return "--";

		if (unit?.toLowerCase() === "imperial") {
			const totalInches = cm / 2.54;
			const feet = Math.floor(totalInches / 12);
			const inches = Math.round(totalInches % 12);
			return `${feet}'${inches}"`;
		}
		return `${cm} cm`;
	};

	// Parse/format as local calendar dates (not UTC) so the picker's day
	// doesn't shift when the local timezone is ahead of or behind UTC.
	const parseDob = (value: string | null): Date => {
		const [year, month, day] = (value ?? "").split("-").map(Number);
		if (!year || !month || !day) {
			return new Date();
		}
		return new Date(year, month - 1, day);
	};

	const formatDateToISO = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const heightOptions =
		unit?.toUpperCase() === "IMPERIAL"
			? IMPERIAL_HEIGHT_OPTIONS
			: METRIC_HEIGHT_OPTIONS;
	const selectedHeightIndex = findNearestOptionIndex(
		heightOptions,
		parseHeightCm(height),
	);

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
				<View style={styles.avatarBlock}>
					<Image
						source={{
							uri: "https://plus.unsplash.com/premium_photo-1739786996040-32bde1db0610?w=500&auto=format&fit=crop&q=60",
						}}
						style={styles.avatar}
					/>
					<Text style={styles.name}>{meData?.me.username}</Text>
					<Text style={styles.joined}>
						Member since{" "}
						{meData?.me.createdAt
							? new Date(meData.me.createdAt).toISOString().split("T")[0]
							: "--"}
					</Text>
				</View>

				<View style={styles.detailsCard}>
					{/* Email Row */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Email</Text>
						</View>

						<Text
							style={styles.value}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{meData?.me.email}
						</Text>
					</View>

					{/* Date of Birth Row */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Date of Birth</Text>
						</View>
						{isEditing ? (
							<Pressable
								style={styles.dropdownTrigger}
								onPress={() => setDobPickerVisible(true)}
							>
								<Text style={styles.dropdownTriggerText}>
									{dob || "--"}
								</Text>
								<Ionicons
									name="chevron-down"
									size={14}
									color="#8E8E93"
								/>
							</Pressable>
						) : (
							<Text
								style={styles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{meData?.me.dateOfBirth || "--"}
							</Text>
						)}
					</View>

					{/* Height Row */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Height</Text>
						</View>
						{isEditing ? (
							<Pressable
								style={styles.dropdownTrigger}
								onPress={() => setHeightPickerVisible(true)}
							>
								<Text style={styles.dropdownTriggerText}>
									{heightOptions[selectedHeightIndex]?.label ?? "--"}
								</Text>
								<Ionicons
									name="chevron-down"
									size={14}
									color="#8E8E93"
								/>
							</Pressable>
						) : (
							<Text
								style={styles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{formatHeightDisplay(height ?? "")}
							</Text>
						)}
					</View>

					{/* Sex Row */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Sex</Text>
						</View>
						{isEditing ? (
							<View style={styles.optionGroup}>
								{(["MALE", "FEMALE"] as const).map((option) => (
									<Pressable
										key={option}
										onPress={() => setSex(option)}
										style={[
											styles.optionPill,
											{
												borderColor: sex === option ? "#4bb7e1" : "#ccc",
												backgroundColor: sex === option ? "#4bb7e1" : "#fff",
											},
										]}
									>
										<Text
											style={{
												color: sex === option ? "#fff" : "#000",
											}}
										>
											{option}
										</Text>
									</Pressable>
								))}
							</View>
						) : (
							<Text
								style={styles.value}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{meData?.me.sex || "--"}
							</Text>
						)}
					</View>

					{/* Unit Preference Row */}
					<View style={styles.row}>
						<View style={styles.leftContainer}>
							<Text style={styles.label}>Unit Preference</Text>
						</View>
						{isEditing ? (
							<View style={styles.optionGroup}>
								{(["METRIC", "IMPERIAL"] as const).map((option) => (
									<Pressable
										key={option}
										onPress={() => setUnit(option)}
										style={[
											styles.optionPill,
											{
												borderColor: unit === option ? "#4bb7e1" : "#ccc",
												backgroundColor: unit === option ? "#4bb7e1" : "#fff",
											},
										]}
									>
										<Text
											style={{
												color: unit === option ? "#fff" : "#000",
											}}
										>
											{option}
										</Text>
									</Pressable>
								))}
							</View>
						) : (
							<Text
								style={styles.value}
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
					<View style={styles.editActionsContainer}>
						<TouchableOpacity
							style={[styles.actionButton, styles.cancelButton]}
							onPress={handleCancel}
						>
							<Text style={styles.cancelButtonText}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.actionButton, styles.saveButton]}
							onPress={handleSave}
							disabled={updating}
						>
							{updating ? (
								<ActivityIndicator
									color="#FFF"
									size="small"
								/>
							) : (
								<Text style={styles.saveButtonText}>Save</Text>
							)}
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						style={styles.editButton}
						onPress={() => setIsEditing(true)}
					>
						<Text style={styles.editButtonText}>Edit Profile</Text>
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
					style={styles.modalBackdrop}
					onPress={() => setHeightPickerVisible(false)}
				>
					<Pressable
						style={styles.modalSheet}
						onPress={() => {}}
					>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Select Height</Text>
							<TouchableOpacity onPress={() => setHeightPickerVisible(false)}>
								<Text style={styles.modalDoneText}>Done</Text>
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
									style={styles.modalOptionRow}
									onPress={() => {
										setHeight(String(item.cm));
										setHeightPickerVisible(false);
									}}
								>
									<Text
										style={[
											styles.modalOptionText,
											index === selectedHeightIndex &&
												styles.modalOptionTextSelected,
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
				value={parseDob(dob)}
				maximumDate={new Date()}
				onChange={(date) => setDob(formatDateToISO(date))}
				onClose={() => setDobPickerVisible(false)}
			/>
		</KeyboardAvoidingView>
	);
}

const rowLayout = {
	flexDirection: "row" as const,
	alignItems: "center" as const,
	justifyContent: "space-between" as const,
	paddingVertical: 14,
	borderBottomWidth: 1,
	borderBottomColor: "#F2F2F7",
};

const boldText16 = { fontSize: 16, fontWeight: "600" as const };

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F4F6F9", padding: 20 },
	avatarBlock: { alignItems: "center", marginTop: 20, marginBottom: 24 },
	avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
	name: { fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
	joined: { fontSize: 13, color: "#8E8E93", marginTop: 4 },
	detailsCard: {
		backgroundColor: "#FFF",
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 24,
	},
	row: {
		...rowLayout,
		gap: 16,
		minHeight: 56,
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

	leftContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	optionGroup: {
		flexDirection: "row",
		gap: 4,
	},
	optionPill: {
		padding: 6,
		borderRadius: 8,
		borderWidth: 1,
	},
	label: {
		fontSize: 15,
		color: "#1A1A1A",
		fontWeight: "500",
	},
	value: {
		fontSize: 15,
		color: "#8E8E93",
		flexShrink: 1,
		textAlign: "right",
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

	editButton: {
		backgroundColor: "#4bb7e1",
		height: 48,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 40,
	},
	editButtonText: { ...boldText16, color: "#FFF" },
	editActionsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 40,
		gap: 12,
	},
	actionButton: {
		flex: 1,
		height: 48,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	cancelButton: { backgroundColor: "#E5E5EA" },
	cancelButtonText: { ...boldText16, color: "#48484A" },
	saveButton: { backgroundColor: "#8bf3a5" },
	saveButtonText: { ...boldText16, color: "#FFF" },

	modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "flex-end",
	},
	modalSheet: {
		backgroundColor: "#FFF",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "60%",
		paddingBottom: Platform.OS === "ios" ? 24 : 12,
	},
	modalHeader: {
		...rowLayout,
		paddingHorizontal: 20,
	},
	modalTitle: { ...boldText16, color: "#1A1A1A" },
	modalDoneText: { ...boldText16, color: "#4bb7e1" },
	modalOptionRow: {
		height: 44,
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	modalOptionText: {
		fontSize: 16,
		color: "#1A1A1A",
	},
	modalOptionTextSelected: {
		color: "#4bb7e1",
		fontWeight: "600",
	},
});
