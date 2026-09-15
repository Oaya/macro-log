import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf={"house"}></NativeTabs.Trigger.Icon>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="log">
				<NativeTabs.Trigger.Label>Log</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon
					sf={"list.bullet.rectangle"}
				></NativeTabs.Trigger.Icon>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="progress">
				<NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf={"chart.bar"}></NativeTabs.Trigger.Icon>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="more">
				<NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon
					sf={"person.crop.circle"}
				></NativeTabs.Trigger.Icon>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
