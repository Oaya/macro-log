import { TypedDocumentNode, gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
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
	TextInput,
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
		email: string;
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
			email
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

	// Initialize local state when Apollo data loads
	useEffect(() => {
		if (meData?.me) {
			setSex(meData?.me.sex);
			setDob(meData.me.dateOfBirth);
			setHeight(String(meData.me.heightCm));
			setUnit(meData.me.unitPreference);
		}
	}, [meData]);

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
					heightCm: height ? parseFloat(height) : 0,
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

	const formatTitleCase = (str: string | null | undefined) => {
		if (!str) return "--";
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
					<Text style={styles.name}>Alex Rivers</Text>
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
							<TextInput
								style={styles.input}
								value={dob ?? ""}
								placeholder="YYYY-MM-DD"
								placeholderTextColor="#C7C7CC"
								onChangeText={(text) => setDob(text)}
							/>
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
								<Text style={styles.dropdownChevron}>⌄</Text>
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
							(["MALE", "FEMALE"] as const).map((option) => (
								<Pressable
									key={option}
									onPress={() => setSex(option)}
									style={{
										padding: 6,
										borderRadius: 8,
										borderWidth: 1,
										borderColor: sex === option ? "#4bb7e1" : "#ccc",
										backgroundColor: sex === option ? "#4bb7e1" : "#fff",
									}}
								>
									<Text
										style={{
											color: sex === option ? "#fff" : "#000",
										}}
									>
										{option}
									</Text>
								</Pressable>
							))
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
							(["METRIC", "IMPERIAL"] as const).map((option) => (
								<Pressable
									key={option}
									onPress={() => setUnit(option)}
									style={{
										padding: 6,
										borderRadius: 8,
										borderWidth: 1,
										borderColor: unit === option ? "#4bb7e1" : "#ccc",
										backgroundColor: unit === option ? "#4bb7e1" : "#fff",
									}}
								>
									<Text
										style={{
											color: unit === option ? "#fff" : "#000",
										}}
									>
										{option}
									</Text>
								</Pressable>
							))
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
					<Pressable style={styles.modalSheet} onPress={() => {}}>
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
		</KeyboardAvoidingView>
	);
}

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
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#F2F2F7",
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
	dropdownChevron: {
		fontSize: 15,
		color: "#8E8E93",
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
		backgroundColor: "#007AFF",
		height: 48,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 40,
	},
	editButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
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
	cancelButtonText: { color: "#48484A", fontSize: 16, fontWeight: "600" },
	saveButton: { backgroundColor: "#34C759" },
	saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#F2F2F7",
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1A1A1A",
	},
	modalDoneText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#007AFF",
	},
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
		color: "#007AFF",
		fontWeight: "600",
	},
});
