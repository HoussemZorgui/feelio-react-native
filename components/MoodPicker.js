import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { DContexts } from "../contexts/DContexts";

const MOODS = [
    { emoji: "😭", label: "Terrible", value: "😭", score: 1 },
    { emoji: "😕", label: "Bad", value: "😕", score: 2 },
    { emoji: "😐", label: "Okay", value: "😐", score: 3 },
    { emoji: "🙂", label: "Good", value: "🙂", score: 4 },
    { emoji: "😄", label: "Great", value: "😄", score: 5 },
];

export const MOOD_SCORES = {
    "😭": 1, "😕": 2, "😐": 3, "🙂": 4, "😄": 5,
};

export default function MoodPicker({ value, onChange }) {
    const { primarycolor, cardcolor, txtcolor } = useContext(DContexts);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: "grey" }]}>How are you feeling?</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {MOODS.map((mood) => {
                    const isSelected = value === mood.value;
                    return (
                        <TouchableOpacity
                            key={mood.value}
                            onPress={() => onChange(mood.value)}
                            style={[
                                styles.moodBtn,
                                { backgroundColor: cardcolor },
                                isSelected && { backgroundColor: primarycolor, borderColor: primarycolor },
                            ]}
                        >
                            <Text style={styles.emoji}>{mood.emoji}</Text>
                            <Text
                                style={[
                                    styles.moodLabel,
                                    { color: isSelected ? "#fff" : "grey" },
                                ]}
                            >
                                {mood.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 13,
        marginBottom: 8,
        marginLeft: 5,
    },
    scroll: {
        flexDirection: "row",
    },
    scrollContent: {
        paddingRight: 10,
        gap: 8,
    },
    moodBtn: {
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        borderRadius: 14,
        minWidth: 65,
        borderWidth: 1.5,
        borderColor: "transparent",
        marginRight: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    emoji: {
        fontSize: 26,
        marginBottom: 4,
    },
    moodLabel: {
        fontSize: 10,
        fontWeight: "600",
    },
});
