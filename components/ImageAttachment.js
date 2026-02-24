import React, { useContext } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { DContexts } from "../contexts/DContexts";

export default function ImageAttachment({ images = [], onChange }) {
    const { primarycolor, cardcolor } = useContext(DContexts);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "We need access to your photos to attach images."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // Changed from true to false as it doesn't work with multiple selection
            quality: 0.7,
            allowsMultipleSelection: true,
        });

        if (!result.canceled && result.assets) {
            const newUris = result.assets.map((a) => a.uri);
            onChange([...images, ...newUris]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "We need camera access to take photos."
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets) {
            onChange([...images, result.assets[0].uri]);
        }
    };

    const removeImage = (index) => {
        const updated = images.filter((_, i) => i !== index);
        onChange(updated);
    };

    const showOptions = () => {
        Alert.alert("Add Photo", "Choose source", [
            { text: "Camera", onPress: takePhoto },
            { text: "Photo Library", onPress: pickImage },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
                {/* Add button */}
                <TouchableOpacity
                    onPress={showOptions}
                    style={[styles.addBtn, { borderColor: primarycolor }]}
                >
                    <Ionicons name="camera-outline" size={24} color={primarycolor} />
                    <Text style={[styles.addText, { color: primarycolor }]}>Add</Text>
                </TouchableOpacity>

                {/* Image thumbnails */}
                {images.map((uri, index) => (
                    <View key={index} style={styles.thumbWrapper}>
                        <Image source={{ uri }} style={styles.thumb} />
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => removeImage(index)}
                        >
                            <Ionicons name="close-circle" size={20} color="#ff3b30" />
                        </TouchableOpacity>
                    </View>
                ))}
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
        color: "grey",
        fontSize: 13,
        marginBottom: 8,
        marginLeft: 5,
    },
    scroll: {
        flexDirection: "row",
    },
    addBtn: {
        width: 70,
        height: 70,
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    addText: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
    },
    thumbWrapper: {
        position: "relative",
        marginRight: 10,
    },
    thumb: {
        width: 70,
        height: 70,
        borderRadius: 12,
    },
    removeBtn: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "white",
        borderRadius: 10,
    },
});
