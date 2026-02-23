import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getAllDiariesForExport } from "../constants/Database";

const exportAsJSON = async () => {
    try {
        const diaries = await getAllDiariesForExport();

        const exportData = {
            app: "Feelio",
            exportDate: new Date().toISOString(),
            totalEntries: diaries.length,
            entries: diaries,
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const fileName = `feelio-backup-${new Date().toISOString().split("T")[0]}.json`;
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
            await Sharing.shareAsync(fileUri, {
                mimeType: "application/json",
                dialogTitle: "Export Feelio Journal",
            });
            return { success: true, entries: diaries.length };
        } else {
            return { success: false, error: "Sharing not available on this device" };
        }
    } catch (error) {
        console.error("Export error:", error);
        return { success: false, error: error.message };
    }
};

export default { exportAsJSON };
