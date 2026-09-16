
import { colors } from "@/styles/colors";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import
    {
        Modal,
        Platform,
        Pressable,
        StyleSheet,
        Text,
        TouchableOpacity,
        View,
    } from "react-native";

type DatePickerModalProps = {
	visible: boolean;
	title: string;
	value: Date;
	onChange: (date: Date) => void;
	onClose: () => void;
	minimumDate?: Date;
	maximumDate?: Date;
};

// iOS shows the calendar inline inside a bottom sheet (Done closes it).
// Android's native dialog opens/closes itself, so it's rendered bare while visible.
export function DatePickerModal({
	visible,
	title,
	value,
	onChange,
	onClose,
	minimumDate,
	maximumDate,
}: DatePickerModalProps) {
	if (Platform.OS === "ios") {
		return (
			<Modal
				visible={visible}
				transparent
				animationType="slide"
				onRequestClose={onClose}
			>
				<Pressable
					style={styles.backdrop}
					onPress={onClose}
				>
					<Pressable
						style={styles.sheet}
						onPress={() => {}}
					>
						<View style={styles.header}>
							<Text style={styles.title}>{title}</Text>
							<TouchableOpacity onPress={onClose}>
								<Text style={styles.doneText}>Done</Text>
							</TouchableOpacity>
						</View>
						<DateTimePicker
							value={value}
							mode="date"
							display="inline"
							themeVariant="light"
							minimumDate={minimumDate}
							maximumDate={maximumDate}
							onValueChange={(_, date) => onChange(date)}
						/>
					</Pressable>
				</Pressable>
			</Modal>
		);
	}

	if (!visible) {
		return null;
	}

	return (
		<DateTimePicker
			value={value}
			mode="date"
			minimumDate={minimumDate}
			maximumDate={maximumDate}
			onValueChange={(_, date) => {
				onChange(date);
				onClose();
			}}
			onDismiss={onClose}
		/>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "flex-end",
	},

	sheet: {
		backgroundColor: colors.card,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "60%",
		paddingBottom: 24,
	},

	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},

	title: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.textPrimary,
	},

	doneText: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.primary,
	},
});
