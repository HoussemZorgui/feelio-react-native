import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import useStyles from "../constants/styles";
import DiaryTopBar from "../components/DiaryTopBar";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getDiary } from "../constants/Database";
import { DContexts } from "../contexts/DContexts";
import MarkdownRenderer from "../components/MarkdownRenderer";

const screenWidth = Dimensions.get("window").width;

export default function Diary() {
  const navigation = useNavigation();
  const route = useRoute();
  const diaryid = route.params.id;
  const [diary, setDiary] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [mood, setMood] = useState(null);
  const [images, setImages] = useState([]);
  const [weather, setWeather] = useState(null);

  const { changedsomething } = useContext(DContexts);
  const css = useStyles();

  const WEATHER_EMOJIS = {
    "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "⛅",
    "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
    "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌦️",
    "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
    "50d": "🌫️", "50n": "🌫️",
  };

  useEffect(() => {
    getDiary(diaryid)
      .then((data) => {
        if (data[0]) {
          setTitle(data[0].title);
          setContent(data[0].content || "");
          setDay(data[0].day);
          setMonth(data[0].monthname);
          setYear(data[0].year);
          setDiary(data[0]);
          setMood(data[0].mood || null);
          if (data[0].images) {
            setImages(data[0].images.split(",").filter(Boolean));
          }
          if (data[0].weather_icon) {
            setWeather({
              icon: data[0].weather_icon,
              temp: data[0].weather_temp,
              city: data[0].weather_city,
              emoji: WEATHER_EMOJIS[data[0].weather_icon] || "🌡️",
            });
          }
        }
      })
      .catch((error) => {
        console.error("Failed to get diary:", error);
      });
  }, [changedsomething]);

  const goToEdit = (did) => {
    navigation.navigate("Edit", { id: did });
  };

  return (
    <ScrollView style={css.container}>
      <SafeAreaView>
        <DiaryTopBar acton={() => goToEdit(diaryid)} diaryid={diaryid} />
        <View style={{ margin: 15 }}>
          {/* Date line with mood and weather */}
          <View style={styles.metaRow}>
            <Text style={css.greytext}>
              {day}, {month} {year}
            </Text>
            <View style={styles.badges}>
              {mood && <Text style={styles.moodBadge}>{mood}</Text>}
              {weather && (
                <View style={styles.weatherBadge}>
                  <Text style={styles.weatherText}>
                    {weather.emoji} {weather.temp}°C · {weather.city}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Title */}
          <Text style={{ ...css.txt, ...styles.title }}>{title}</Text>

          {/* Content with Markdown rendering */}
          <MarkdownRenderer content={content} />

          {/* Images */}
          {images.length > 0 && (
            <View style={styles.imagesSection}>
              <Text style={[css.greytext, { marginBottom: 8, marginLeft: 0 }]}>
                📷 Photos ({images.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  moodBadge: {
    fontSize: 22,
  },
  weatherBadge: {
    backgroundColor: "rgba(120,86,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  weatherText: {
    fontSize: 11,
    color: "#7856FF",
    fontWeight: "600",
  },
  title: {
    margin: 0,
    marginLeft: 0,
    marginTop: 6,
    marginBottom: 12,
    padding: 0,
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  imagesSection: {
    marginTop: 20,
  },
  image: {
    width: screenWidth * 0.75,
    height: 220,
    borderRadius: 16,
    marginRight: 12,
  },
});
