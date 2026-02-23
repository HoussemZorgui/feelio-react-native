import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import useStyles from "../constants/styles";
import AddTopBar from "../components/AddTopBar";
import { insertDiary } from "../constants/Database";
import { useNavigation } from "@react-navigation/native";
import SpeechToText from "../components/Voice";
import { DContexts } from "../contexts/DContexts";
import SecureStoreModel from "../constants/SecureStoreModel";
import MoodPicker from "../components/MoodPicker";
import ImageAttachment from "../components/ImageAttachment";
import RichToolbar from "../components/RichToolbar";
import { fetchWeatherData } from "../api/weatherAPI";
import { getCurrentLocation } from "../utils/location";

export default function Add() {
  const css = useStyles();
  const [voiceMode, setVoiceMode] = useState(false);
  const navigation = useNavigation();
  const [text, onChangeTitle] = React.useState("");
  const [value, onChangeText] = React.useState("");
  const [mood, setMood] = useState(null);
  const [images, setImages] = useState([]);
  const [weatherSnapshot, setWeatherSnapshot] = useState(null);
  const { changedsomething } = useContext(DContexts);
  const { setChangedSomething } = useContext(DContexts);
  const { txtcolor } = useContext(DContexts);
  const contentInputRef = useRef(null);

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const monthIndex = date.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthName = monthNames[monthIndex];
  const year = date.getFullYear();
  const unixTimestampSeconds = Math.floor(date.getTime() / 1000);
  const hour = date.getHours();
  const minute = date.getMinutes();

  // Fetch weather in background when screen loads
  useEffect(() => {
    const loadWeather = async () => {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        const w = await fetchWeatherData(latitude, longitude);
        if (w) setWeatherSnapshot(w);
      } catch {
        // Not critical — weather capture is optional
      }
    };
    loadWeather();
  }, []);

  const submitDiary = async () => {
    try {
      const imagesStr = images.length > 0 ? images.join(",") : null;
      await insertDiary(
        text,
        value,
        year,
        month,
        day,
        hour,
        minute,
        monthName,
        unixTimestampSeconds,
        mood,
        weatherSnapshot?.icon || null,
        weatherSnapshot?.temp || null,
        weatherSnapshot?.city || null,
        imagesStr
      );
      setChangedSomething(Math.floor(Math.random() * 5000));
      onChangeText("");
      onChangeTitle("");
      setMood(null);
      setImages([]);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Failed to insert Diary:", error);
    }
  };

  const navigationState = navigation.getState();
  const routeName = navigationState.routes[navigationState.index].name;

  useEffect(() => {
    if (routeName === "mic") {
      setVoiceMode(true);
    }
  }, []);

  useEffect(() => {
    if (changedsomething && voiceMode) {
      onChangeText(changedsomething.toString());
    }
  }, [changedsomething]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={css.container}>
        <SafeAreaView>
          <AddTopBar acton={submitDiary} />

          {!voiceMode ? (
            <View style={{ paddingBottom: 20 }}>
              {/* Title */}
              <View style={{ padding: 10 }}>
                <Text style={css.greytext}>Title</Text>
                <TextInput
                  style={{ ...css.txt, ...styles.title_input }}
                  onChangeText={onChangeTitle}
                  value={text}
                  placeholder="Enter your title"
                  autoFocus={true}
                  placeholderTextColor={txtcolor}
                />
              </View>

              {/* Mood Picker */}
              <MoodPicker value={mood} onChange={setMood} />

              {/* Rich text toolbar */}
              <Text style={[css.greytext, { paddingHorizontal: 15, marginTop: 8 }]}>Content</Text>
              <RichToolbar
                textInputRef={contentInputRef}
                value={value}
                onChangeText={onChangeText}
              />
              <View style={{ paddingHorizontal: 10 }}>
                <TextInput
                  ref={contentInputRef}
                  editable
                  multiline
                  numberOfLines={10}
                  maxLength={10000}
                  placeholder="How are you feeling? Use **bold**, _italic_, • bullets..."
                  onChangeText={(t) => onChangeText(t)}
                  value={value}
                  style={{ ...css.txt, padding: 15 }}
                  textAlignVertical="top"
                  placeholderTextColor={txtcolor}
                />
              </View>

              {/* Weather snapshot */}
              {weatherSnapshot && (
                <View style={styles.weatherBadge}>
                  <Text style={styles.weatherText}>
                    {weatherSnapshot.emoji} {weatherSnapshot.temp}°C in {weatherSnapshot.city}
                  </Text>
                </View>
              )}

              {/* Image Attachment */}
              <ImageAttachment images={images} onChange={setImages} />
            </View>
          ) : (
            <>
              <SpeechToText />
            </>
          )}
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title_input: {
    margin: 15,
    padding: 5,
    fontSize: 17,
  },
  weatherBadge: {
    marginHorizontal: 15,
    marginTop: 4,
    marginBottom: 8,
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(120,86,255,0.1)",
    alignSelf: "flex-start",
  },
  weatherText: {
    fontSize: 12,
    color: "#7856FF",
    fontWeight: "600",
  },
});
