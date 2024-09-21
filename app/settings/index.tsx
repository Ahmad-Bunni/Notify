import { Button, Text } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import notifee, {
  AndroidNotificationSetting,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";
import { Stack } from "expo-router";
import React from "react";
import { Alert, View } from "react-native";

export default function SettingsScreen() {
  const [hour, setHour] = React.useState<string>("");
  const [minute, setMinute] = React.useState<string>("");

  const disableBattery = async () => {
    const batteryOptimizationEnabled =
      await notifee.isBatteryOptimizationEnabled();
    if (batteryOptimizationEnabled) {
      Alert.alert(
        "Restrictions Detected",
        "To ensure notifications are delivered, please disable battery optimization for the app.",
        [
          {
            text: "OK, open settings",
            onPress: async () =>
              await notifee.openBatteryOptimizationSettings(),
          },
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
        ],
        { cancelable: false }
      );
    }
  };

  const disablePower = async () => {
    const powerManagerInfo = await notifee.getPowerManagerInfo();
    if (powerManagerInfo.activity) {
      Alert.alert(
        "Restrictions Detected",
        "To ensure notifications are delivered, please adjust your settings to prevent the app from being killed",
        [
          {
            text: "OK, open settings",
            onPress: async () => await notifee.openPowerManagerSettings(),
          },
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
        ],
        { cancelable: false }
      );
    }
  };

  const isTimeValid = () => {
    const hourNum = Number(hour);
    const minuteNum = Number(minute);
    if (isNaN(Number(hour)) || isNaN(Number(minute))) {
      return false;
    }

    if (hourNum > 24) return false;
    if (minuteNum > 60) return false;

    return true;
  };

  async function handleActivateReminder() {
    if (!isTimeValid()) {
      Alert.alert("Time", "Invalid Time");
      return;
    }

    const settings = await notifee.getNotificationSettings();
    if (settings.android.alarm !== AndroidNotificationSetting.ENABLED) {
      await notifee.openAlarmPermissionSettings();
    }

    await notifee.requestPermission();

    const date = new Date();
    date.setHours(Number(hour));
    date.setMinutes(Number(minute));

    if (date <= new Date()) {
      date.setDate(date.getDate() + 1);
    }
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.cancelAllNotifications();

    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
    });

    await notifee.createTriggerNotification(
      {
        title: "Notify",
        body: "Check Renewals!",
        android: {
          channelId: channelId,
        },
      },
      trigger
    );

    Alert.alert("Notification", `Daily notification starts at ${date}`);
  }

  return (
    <View className="gap-4 p-4">
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />

      <View className="flex flex-col gap-2">
        <Label nativeID="hour">Set Hour</Label>
        <Input
          maxLength={2}
          placeholder="24-Format"
          keyboardType="number-pad"
          onChangeText={setHour}
        />

        <Label nativeID="min">Set Minutes</Label>

        <Input
          maxLength={2}
          placeholder="Minutes"
          keyboardType="number-pad"
          onChangeText={setMinute}
        />
      </View>

      <Button variant="default" onPress={handleActivateReminder}>
        <Text>Save Notification</Text>
      </Button>
      <Button variant="default" onPress={disableBattery}>
        <Text>Disable Battry Optimization</Text>
      </Button>
      <Button variant="default" onPress={disablePower}>
        <Text>Disable Power Management</Text>
      </Button>
    </View>
  );
}
