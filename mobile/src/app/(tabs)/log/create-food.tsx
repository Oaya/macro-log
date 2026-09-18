import { TextInput } from "@/components/text-input";
import { CREATE_FOOD } from "@/graphql/food";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/common";
import { useMutation } from "@apollo/client/react";
import { router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function CreateFood() {
	const [createFood, { loading: saving }] = useMutation(CREATE_FOOD);

	const [name, setName] = useState("");
	const [servingSize, setServingSize] = useState("");
	const [calories, setCalories] = useState<string | null>();
	const [proteinG, setProteinG] = useState<string | null>();
	const [carbsG, setCarbsG] = useState<string | null>();
	const [fatG, setFatG] = useState<string | null>();
	const [fiberG, setFiberG] = useState<string | null>();
	const [sodiumMg, setSodiumMg] = useState<string | null>();

	const resetForm = () => {
		setName("");
		setServingSize("");
		setCalories(null);
		setCarbsG(null);
		setFatG(null);
		setFiberG(null);
		setSodiumMg(null);
	};

	const handleLog = async () => {
		if (!name) return Alert.alert("Enter a name");
		if (!calories) return Alert.alert("Enter a calories");

		try {
			const result = await createFood({
				variables: {
					name: name,
					servingSize: servingSize,
					calories: Number(calories),
					proteinG: Number(proteinG),
					carbsG: Number(carbsG),
					fatG: Number(fatG),
					fiberG: fiberG ? Number(fiberG) : null,
					sodiumMg: sodiumMg ? Number(sodiumMg) : null,
				},
			});

			const created = result.data?.createFood;
			resetForm();
			if (created) {
				router.navigate({
					pathname: "/(tabs)/log/food",
					params: { createdFood: JSON.stringify(created) },
				});
			}
		} catch (e: any) {
			Alert.alert("Error", e.message);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={commonStyles.logRowTextContainer}
		>
			<ScrollView
				style={commonStyles.container}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
			>
				<Text style={commonStyles.heading}>Create My Meal</Text>

				<View style={commonStyles.menuContainer}>
					<Text style={commonStyles.sectionHeading}>Meal</Text>

					<View>
						<View style={commonStyles.row}>
							<View style={commonStyles.leftContainer}>
								<Text style={commonStyles.label}>Name</Text>
							</View>

							<View style={commonStyles.inputInlineWrapper}>
								<TextInput
									value={name}
									onChangeText={setName}
									placeholderTextColor={colors.placeholder}
									style={[commonStyles.input, styles.mealNameInput]}
								/>
							</View>
						</View>

						<View style={commonStyles.row}>
							<View style={commonStyles.leftContainer}>
								<Text style={commonStyles.label}>Serving size</Text>
							</View>

							<View style={commonStyles.inputInlineWrapper}>
								<TextInput
									placeholder="1 cup"
									value={servingSize}
									onChangeText={setServingSize}
									placeholderTextColor={colors.placeholder}
									style={commonStyles.input}
								/>
							</View>
						</View>
					</View>
				</View>

				<View style={commonStyles.menuContainer}>
					<Text style={commonStyles.sectionHeading}>nutrition</Text>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<View>
								<Text style={commonStyles.label}>Calories</Text>
								<Text style={styles.requirementText}>Required</Text>
							</View>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								value={calories ?? ""}
								onChangeText={setCalories}
								keyboardType="numeric"
								placeholder="0"
								placeholderTextColor={colors.placeholder}
								style={commonStyles.input}
							/>
							<Text style={commonStyles.inputSuffix}>G</Text>
						</View>
					</View>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<View>
								<Text style={commonStyles.label}>Carbs</Text>
								<Text style={styles.requirementText}>Required</Text>
							</View>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								value={carbsG ?? ""}
								onChangeText={setCarbsG}
								keyboardType="numeric"
								placeholder="0"
								placeholderTextColor={colors.placeholder}
								style={commonStyles.input}
							/>
							<Text style={commonStyles.inputSuffix}>G</Text>
						</View>
					</View>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<View>
								<Text style={commonStyles.label}>Protein</Text>
								<Text style={styles.requirementText}>Required</Text>
							</View>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								value={proteinG ?? ""}
								onChangeText={setProteinG}
								keyboardType="numeric"
								placeholder="0"
								placeholderTextColor={colors.placeholder}
								style={commonStyles.input}
							/>
							<Text style={commonStyles.inputSuffix}>G</Text>
						</View>
					</View>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<View>
								<Text style={commonStyles.label}>Fat</Text>
								<Text style={styles.requirementText}>Required</Text>
							</View>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								value={fatG ?? ""}
								onChangeText={setFatG}
								keyboardType="numeric"
								placeholder="0"
								placeholderTextColor={colors.placeholder}
								style={commonStyles.input}
							/>
							<Text style={commonStyles.inputSuffix}>G</Text>
						</View>
					</View>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<View>
								<Text style={commonStyles.label}>Fiber</Text>
								<Text style={styles.requirementText}>Optional</Text>
							</View>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								value={fiberG ?? ""}
								onChangeText={setFiberG}
								keyboardType="numeric"
								placeholder="0"
								placeholderTextColor={colors.placeholder}
								style={commonStyles.input}
							/>
							<Text style={commonStyles.inputSuffix}>G</Text>
						</View>
					</View>

					<View style={commonStyles.row}>
						<View style={commonStyles.leftContainer}>
							<View>
								<Text style={commonStyles.label}>Sodium</Text>
								<Text style={styles.requirementText}>Optional</Text>
							</View>
						</View>

						<View style={commonStyles.inputInlineWrapper}>
							<TextInput
								value={sodiumMg ?? ""}
								onChangeText={setSodiumMg}
								keyboardType="numeric"
								placeholder="0"
								placeholderTextColor={colors.placeholder}
								style={commonStyles.input}
							/>
							<Text style={commonStyles.inputSuffix}>Mg</Text>
						</View>
					</View>
				</View>

				<TouchableOpacity
					onPress={handleLog}
					disabled={saving}
					style={commonStyles.submitButtonTight}
				>
					<Text style={commonStyles.submitButtonText}>
						{saving ? "Saving..." : "Create Food"}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		paddingBottom: 100,
	},
	mealNameInput: {
		flex: 1,
		maxWidth: "95%",
		textAlign: "left",
	},
	requirementText: {
		fontSize: 12,
		color: colors.textSecondary,
		marginTop: 2,
	},
});
