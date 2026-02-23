import React, { useState, useEffect, useContext, useRef } from "react";
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
import EditTopBar from "../components/EditTopBar";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getDiary, updateDiary } from "../constants/Database";
import { DContexts } from "../contexts/DContexts";
import MoodPicker from "../components/MoodPicker";
import ImageAttachment from "../components/ImageAttachment";
import RichToolbar from "../components/RichToolbar";

export default function Edit() {
  const css = useStyles();
  const route = useRoute();
  const navigation = useNavigation();
  const diaryid = route.params.id;
  const [text, onChangeTitle] = React.useState("");
  const [value, onChangeText] = React.useState("");
  const [mood, setMood] = useState(null);
  const [images, setImages] = useState([]);
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const { setChangedSomething, txtcolor } = useContext(DContexts);
  const contentInputRef = useRef(null);

  useEffect(() => {
    getDiary(diaryid)
      .then((data) => {
        if (data[0]) {
          onChangeTitle(data[0].title);
          onChangeText(data[0].content || "");
          setDay(data[0].day);
          setMonth(data[0].monthname);
          setYear(data[0].year);
          setMood(data[0].mood || null);
          if (data[0].images) {
            setImages(data[0].images.split(",").filter(Boolean));
          }
        }
      })
      .catch((error) => {
        console.error("Failed to get diaries:", error);
      });
  }, []);

  const editDiary = async () => {
    try {
      const imagesStr = images.length > 0 ? images.join(",") : null;
      await updateDiary(diaryid, text, value, mood, imagesStr);
      setChangedSomething(Math.floor(Math.random() * 5000));
      navigation.navigate("Diary", { id: diaryid });
    } catch (error) {
      console.error("Failed to update Diary:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={css.container}>
        <SafeAreaView>
          <EditTopBar acton={editDiary} />
          <View style={{ paddingBottom: 20 }}>
            {/* Title */}
            <View style={{ padding: 10 }}>
              <Text style={css.greytext}>Title</Text>
              <TextInput
                style={{ ...css.txt, ...styles.title_input }}
                onChangeText={onChangeTitle}
                value={text}
                placeholder="Enter your title"
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
                placeholder="How are you feeling?"
                onChangeText={(t) => onChangeText(t)}
                value={value}
                style={{ ...css.txt, padding: 15 }}
                textAlignVertical="top"
                autoFocus={true}
                placeholderTextColor={txtcolor}
              />
            </View>

            {/* Image Attachment */}
            <ImageAttachment images={images} onChange={setImages} />
          </View>
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
});
