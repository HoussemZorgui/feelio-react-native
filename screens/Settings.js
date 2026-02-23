import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import useStyles from "../constants/styles";
import CircularChip from "../components/CircularChip";
import { useNavigation } from "@react-navigation/native";
import { DContexts } from "../contexts/DContexts";
import NotificationService from "../utils/NotificationService";
import ExportService from "../utils/ExportService";
import { Ionicons } from "@expo/vector-icons";

export default function Settings() {
  const css = useStyles();
  const { primarycolor, cardcolor, txtcolor } = useContext(DContexts);
  const navigation = useNavigation();

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(20);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await NotificationService.getSavedReminderTime();
      setReminderEnabled(saved.enabled);
      setReminderHour(saved.hour);
      setReminderMinute(saved.minute);
    };
    loadSettings();
  }, []);

  const toggleReminder = async (value) => {
    if (value) {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to use this feature."
        );
        return;
      }
      const success = await NotificationService.scheduleDailyReminder(
        reminderHour,
        reminderMinute
      );
      if (success) {
        setReminderEnabled(true);
        Alert.alert(
          "✅ Reminder Set",
          `You'll be reminded daily at ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}.`
        );
      }
    } else {
      await NotificationService.cancelReminder();
      setReminderEnabled(false);
    }
  };

  const changeHour = (delta) => {
    const newHour = (reminderHour + delta + 24) % 24;
    setReminderHour(newHour);
    if (reminderEnabled) {
      NotificationService.scheduleDailyReminder(newHour, reminderMinute);
    }
  };

  const changeMinute = (delta) => {
    const newMin = (reminderMinute + delta + 60) % 60;
    setReminderMinute(newMin);
    if (reminderEnabled) {
      NotificationService.scheduleDailyReminder(reminderHour, newMin);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const result = await ExportService.exportAsJSON();
    setIsExporting(false);
    if (!result.success) {
      Alert.alert("Export Failed", result.error || "Something went wrong.");
    }
  };

  const SectionTitle = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: "grey" }]}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={css.container}>
      <SafeAreaView style={{ paddingBottom: 100 }}>
        <Text style={css.pagetitle}>Settings</Text>

        {/* ── Theme ── */}
        <SectionTitle title="THEME" />
        <ScrollView style={styles.chsroll} showsHorizontalScrollIndicator={false} horizontal>
          <CircularChip name="Dark" color="#f5f5f5" backcolor="#15202B" type="theme" />
          <CircularChip name="Light" color="#000" backcolor="#f5f5f5" type="theme" />
        </ScrollView>

        {/* ── Accent Color ── */}
        <SectionTitle title="ACCENT COLOR" />
        <ScrollView style={styles.chsroll} showsHorizontalScrollIndicator={false} horizontal>
          <CircularChip name="Blue" color="#fff" backcolor="#1D9BF0" type="color" opacity="#8ecdf8" />
          <CircularChip name="Pink" color="#fff" backcolor="#f91880" opacity="#fc80b9" type="color" />
          <CircularChip name="Purple" type="color" color="#fff" backcolor="#7856FF" opacity="#a089ff" />
          <CircularChip name="Orange" color="#fff" backcolor="#FF7A00" opacity="#ffa24c" type="color" />
          <CircularChip name="Green" color="#fff" backcolor="#00BA7C" opacity="#66d6b0" type="color" />
        </ScrollView>

        {/* ── Daily Reminder ── */}
        <SectionTitle title="DAILY REMINDER" />
        <View style={[styles.card, { backgroundColor: cardcolor }]}>
          <View style={styles.reminderRow}>
            <View>
              <Text style={[styles.cardTitle, { color: txtcolor }]}>
                📝 Journal Reminder
              </Text>
              <Text style={styles.cardSubtitle}>Get a daily nudge to write</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: "#ccc", true: primarycolor }}
              thumbColor="#fff"
            />
          </View>

          {/* Time Picker */}
          <View style={styles.timePicker}>
            {/* Hour */}
            <View style={styles.timeUnit}>
              <TouchableOpacity onPress={() => changeHour(1)} style={styles.timeArrow}>
                <Ionicons name="chevron-up" size={20} color={primarycolor} />
              </TouchableOpacity>
              <Text style={[styles.timeValue, { color: txtcolor }]}>
                {String(reminderHour).padStart(2, "0")}
              </Text>
              <TouchableOpacity onPress={() => changeHour(-1)} style={styles.timeArrow}>
                <Ionicons name="chevron-down" size={20} color={primarycolor} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.timeSep, { color: txtcolor }]}>:</Text>
            {/* Minute */}
            <View style={styles.timeUnit}>
              <TouchableOpacity onPress={() => changeMinute(5)} style={styles.timeArrow}>
                <Ionicons name="chevron-up" size={20} color={primarycolor} />
              </TouchableOpacity>
              <Text style={[styles.timeValue, { color: txtcolor }]}>
                {String(reminderMinute).padStart(2, "0")}
              </Text>
              <TouchableOpacity onPress={() => changeMinute(-5)} style={styles.timeArrow}>
                <Ionicons name="chevron-down" size={20} color={primarycolor} />
              </TouchableOpacity>
            </View>
          </View>
          {reminderEnabled && (
            <Text style={styles.reminderStatus}>
              🔔 Active – reminding you at {String(reminderHour).padStart(2, "0")}:{String(reminderMinute).padStart(2, "0")} daily
            </Text>
          )}
        </View>

        {/* ── Security ── */}
        <SectionTitle title="SECURITY" />
        <TouchableOpacity onPress={() => navigation.navigate("EditPin")}>
          <View style={[styles.card, styles.rowCard, { backgroundColor: cardcolor }]}>
            <View style={styles.rowCardLeft}>
              <Ionicons name="lock-closed-outline" size={22} color={primarycolor} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.cardTitle, { color: txtcolor }]}>Change PIN</Text>
                <Text style={styles.cardSubtitle}>Update your app lock code</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="grey" />
          </View>
        </TouchableOpacity>

        {/* ── Data ── */}
        <SectionTitle title="DATA & PRIVACY" />
        <TouchableOpacity onPress={handleExport} disabled={isExporting}>
          <View
            style={[
              styles.card,
              styles.rowCard,
              { backgroundColor: cardcolor, opacity: isExporting ? 0.6 : 1 },
            ]}
          >
            <View style={styles.rowCardLeft}>
              <Ionicons name="download-outline" size={22} color={primarycolor} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.cardTitle, { color: txtcolor }]}>Export my Journal</Text>
                <Text style={styles.cardSubtitle}>Save all entries as a JSON file</Text>
              </View>
            </View>
            {isExporting ? (
              <ActivityIndicator size="small" color={primarycolor} />
            ) : (
              <Ionicons name="share-outline" size={18} color="grey" />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Feelio v1.0 · All data stored locally</Text>
          <Text style={styles.footerText}>🔒 Your journal, your privacy</Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  chsroll: {
    padding: 10,
    paddingLeft: 14,
  },
  card: {
    marginHorizontal: 14,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowCardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  cardSubtitle: {
    color: "grey",
    fontSize: 12,
    marginTop: 2,
  },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  timeUnit: {
    alignItems: "center",
    gap: 4,
  },
  timeArrow: {
    padding: 4,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 2,
    width: 70,
    textAlign: "center",
  },
  timeSep: {
    fontSize: 36,
    fontWeight: "bold",
    marginHorizontal: 8,
    marginBottom: 8,
  },
  reminderStatus: {
    color: "#34C759",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 30,
    paddingBottom: 20,
    gap: 4,
  },
  footerText: {
    color: "grey",
    fontSize: 12,
  },
});
