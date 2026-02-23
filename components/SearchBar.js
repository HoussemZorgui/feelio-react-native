import React, { useContext, useRef } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DContexts } from "../contexts/DContexts";

export default function SearchBar({ value, onChangeText, onClose }) {
    const { primarycolor, cardcolor, txtcolor } = useContext(DContexts);
    const inputRef = useRef(null);

    return (
        <View style={[styles.container, { backgroundColor: cardcolor }]}>
            <Ionicons
                name="search-outline"
                size={18}
                color="grey"
                style={styles.icon}
            />
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={onChangeText}
                placeholder="Search your journal..."
                placeholderTextColor="grey"
                style={[styles.input, { color: txtcolor }]}
                autoFocus
                returnKeyType="search"
                clearButtonMode="while-editing"
            />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={20} color="grey" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        margin: 10,
        marginTop: 5,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 2,
    },
    closeBtn: {
        marginLeft: 6,
    },
});
