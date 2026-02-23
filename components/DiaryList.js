import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DContexts } from "../contexts/DContexts";
import React, { useContext } from "react";
import useStyles from "../constants/styles";

const WEATHER_EMOJIS = {
  "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "⛅",
  "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌦️",
  "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
  "50d": "🌫️", "50n": "🌫️",
};

export default function DiaryListItem({ id, title, timestamp, data }) {
  const navigation = useNavigation();
  const { primarycolor, txtcolor, cardcolor } = useContext(DContexts);
  const css = useStyles();

  const goToDiary = (did) => navigation.navigate("Diary", { id: did });

  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  let hour = date.getHours();
  const minute = date.getMinutes();
  const amPm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const formattedMinute = minute < 10 ? `0${minute}` : minute;

  const hasMood = data?.mood;
  const hasWeather = data?.weather_icon;
  const hasImages = data?.images && data.images.length > 0;
  const firstImage = hasImages ? data.images.split(",")[0] : null;
  const weatherEmoji = hasWeather ? (WEATHER_EMOJIS[data.weather_icon] || "🌡️") : null;

  return (
    <TouchableOpacity
      onPress={() => goToDiary(id)}
      style={{ backgroundColor: cardcolor, ...styles.dlist }}
    >
      {/* Left: icon or thumbnail */}
      <View style={styles.leftIcon}>
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="book-sharp" size={32} color={primarycolor} />
        )}
      </View>

      {/* Center: info */}
      <View style={styles.centerContent}>
        <Text style={styles.dlistTop}>
          {hour}:{formattedMinute} {amPm} · {day} {month} {year}
        </Text>
        <Text style={{ color: txtcolor, ...styles.dlistMain }} numberOfLines={1}>
          {title}
        </Text>
        {/* Badges row */}
        <View style={styles.badgeRow}>
          {hasMood && <Text style={styles.moodEmoji}>{data.mood}</Text>}
          {hasWeather && (
            <Text style={styles.weatherBadge}>
              {weatherEmoji} {Math.round(data.weather_temp)}°C
            </Text>
          )}
          {hasImages && (
            <View style={styles.photoBadge}>
              <Ionicons name="images-outline" size={11} color="grey" />
              <Text style={styles.photoBadgeText}>
                {data.images.split(",").length}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rightChevron}>
        <Ionicons name="chevron-forward" size={18} color="grey" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dlist: {
    marginHorizontal: 14,
    marginBottom: 8,
    padding: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  leftIcon: {
    marginRight: 12,
  },
  thumbnail: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  centerContent: {
    flex: 1,
  },
  dlistTop: {
    color: "grey",
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dlistMain: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  moodEmoji: {
    fontSize: 14,
  },
  weatherBadge: {
    fontSize: 11,
    color: "#7856FF",
    backgroundColor: "rgba(120,86,255,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  photoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  photoBadgeText: {
    fontSize: 11,
    color: "grey",
  },
  rightChevron: {
    marginLeft: 6,
  },
});
