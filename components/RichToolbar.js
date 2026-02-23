import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DContexts } from "../contexts/DContexts";

export default function RichToolbar({ textInputRef, value, onChangeText }) {
    const { primarycolor, cardcolor } = useContext(DContexts);

    const insertAtCursor = (before, after = "") => {
        if (textInputRef && textInputRef.current) {
            // Insert markdown syntax wrapping the placeholder text
            const placeholder = after ? "text" : "";
            const insert = before + placeholder + after;
            onChangeText(value + insert);
        }
    };

    const wrapSelection = (before, after) => {
        // Convenience: append markup at end of text
        onChangeText(value + before + "text" + after);
    };

    const insertBullet = () => {
        const lines = value.split("\n");
        const lastLine = lines[lines.length - 1];
        if (lastLine === "") {
            onChangeText(value + "• ");
        } else {
            onChangeText(value + "\n• ");
        }
    };

    const tools = [
        {
            icon: "text",
            label: "B",
            onPress: () => wrapSelection("**", "**"),
            style: { fontWeight: "bold", fontSize: 16 },
        },
        {
            icon: "text",
            label: "I",
            onPress: () => wrapSelection("_", "_"),
            style: { fontStyle: "italic", fontSize: 16 },
        },
        {
            icon: "list",
            label: "•",
            onPress: insertBullet,
            style: { fontSize: 20 },
        },
        {
            icon: "remove-outline",
            label: "—",
            onPress: () => onChangeText(value + "\n---\n"),
            style: { fontSize: 16 },
        },
    ];

    return (
        <View style={[styles.toolbar, { backgroundColor: cardcolor }]}>
            {tools.map((tool) => (
                <TouchableOpacity
                    key={tool.label}
                    onPress={tool.onPress}
                    style={[styles.toolBtn, { borderColor: primarycolor + "40" }]}
                >
                    <Text style={[styles.toolText, { color: primarycolor }, tool.style]}>
                        {tool.label}
                    </Text>
                </TouchableOpacity>
            ))}
            <Text style={styles.hint}>Markdown supported</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    toolbar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 6,
        elevation: 1,
    },
    toolBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 6,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 36,
        alignItems: "center",
    },
    toolText: {
        fontWeight: "700",
    },
    hint: {
        color: "grey",
        fontSize: 10,
        marginLeft: "auto",
    },
});
