import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const REMINDER_HOUR_KEY = "reminder_hour";
const REMINDER_MINUTE_KEY = "reminder_minute";
const REMINDER_ENABLED_KEY = "reminder_enabled";

const requestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("daily-reminder", {
            name: "Daily Journal Reminder",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#7856FF",
        });
    }

    return finalStatus === "granted";
};

const scheduleDailyReminder = async (hour, minute) => {
    try {
        // Cancel any existing reminders
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Save the time preference
        await SecureStore.setItemAsync(REMINDER_HOUR_KEY, hour.toString());
        await SecureStore.setItemAsync(REMINDER_MINUTE_KEY, minute.toString());
        await SecureStore.setItemAsync(REMINDER_ENABLED_KEY, "true");

        // Schedule the daily notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "📝 Time to journal!",
                body: "How are you feeling today? Take a moment to write in Feelio.",
                sound: true,
                data: { screen: "Add" },
            },
            trigger: {
                hour: hour,
                minute: minute,
                repeats: true,
                channelId: "daily-reminder",
            },
        });

        return true;
    } catch (error) {
        console.error("Error scheduling notification:", error);
        return false;
    }
};

const cancelReminder = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await SecureStore.setItemAsync(REMINDER_ENABLED_KEY, "false");
        return true;
    } catch (error) {
        console.error("Error cancelling notification:", error);
        return false;
    }
};

const getSavedReminderTime = async () => {
    try {
        const hour = await SecureStore.getItemAsync(REMINDER_HOUR_KEY);
        const minute = await SecureStore.getItemAsync(REMINDER_MINUTE_KEY);
        const enabled = await SecureStore.getItemAsync(REMINDER_ENABLED_KEY);
        return {
            hour: hour ? parseInt(hour) : 20,
            minute: minute ? parseInt(minute) : 0,
            enabled: enabled === "true",
        };
    } catch (error) {
        return { hour: 20, minute: 0, enabled: false };
    }
};

export default {
    requestPermissions,
    scheduleDailyReminder,
    cancelReminder,
    getSavedReminderTime,
};
