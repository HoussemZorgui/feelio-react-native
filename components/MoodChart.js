import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getRecentDiaries } from "../constants/Database";
import { MOOD_SCORES } from "./MoodPicker";
import { DContexts } from "../contexts/DContexts";

const screenWidth = Dimensions.get("window").width - 40;

export default function MoodChart() {
    const [chartData, setChartData] = useState(null);
    const [streak, setStreak] = useState(0);
    const [totalEntries, setTotalEntries] = useState(0);
    const { primarycolor, cardcolor, txtcolor } = useContext(DContexts);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const diaries = await getRecentDiaries(7);
            setTotalEntries(diaries.length);

            // Build streak
            const today = new Date();
            let streakCount = 0;
            for (let i = 0; i < 30; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - i);
                const y = checkDate.getFullYear();
                const m = checkDate.getMonth() + 1;
                const d = checkDate.getDate();
                const hasEntry = diaries.some(
                    (diary) =>
                        diary.year === y &&
                        diary.month === m &&
                        diary.day === d
                );
                if (hasEntry) streakCount++;
                else if (i > 0) break;
            }
            setStreak(streakCount);

            // Build last 7 days mood chart
            const last7 = [];
            const labels = [];
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dayEntries = diaries.filter((diary) => {
                    const entryDate = new Date(diary.timestamp * 1000);
                    return (
                        entryDate.getFullYear() === d.getFullYear() &&
                        entryDate.getMonth() === d.getMonth() &&
                        entryDate.getDate() === d.getDate()
                    );
                });
                const moodEntry = dayEntries.find((e) => e.mood && MOOD_SCORES[e.mood]);
                const score = moodEntry ? MOOD_SCORES[moodEntry.mood] : 0;
                last7.push(score);
                labels.push(dayNames[d.getDay()]);
            }

            if (last7.some((v) => v > 0)) {
                setChartData({ labels, datasets: [{ data: last7 }] });
            }
        } catch (e) {
            console.log("Mood chart error:", e);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: cardcolor }]}>
            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: primarycolor + "18" }]}>
                    <Text style={[styles.statNumber, { color: primarycolor }]}>{streak}</Text>
                    <Text style={styles.statLabel}>🔥 Day Streak</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: primarycolor + "18" }]}>
                    <Text style={[styles.statNumber, { color: primarycolor }]}>{totalEntries}</Text>
                    <Text style={styles.statLabel}>📖 This Week</Text>
                </View>
            </View>

            {/* Mood Chart */}
            {chartData ? (
                <View style={styles.chartSection}>
                    <Text style={[styles.chartTitle, { color: txtcolor }]}>Mood This Week</Text>
                    <LineChart
                        data={chartData}
                        width={screenWidth - 30}
                        height={130}
                        yAxisInterval={1}
                        fromZero
                        chartConfig={{
                            backgroundColor: cardcolor,
                            backgroundGradientFrom: cardcolor,
                            backgroundGradientTo: cardcolor,
                            decimalPlaces: 0,
                            color: (opacity = 1) => primarycolor,
                            labelColor: () => "grey",
                            style: { borderRadius: 16 },
                            propsForDots: {
                                r: "5",
                                strokeWidth: "2",
                                stroke: primarycolor,
                            },
                        }}
                        bezier
                        style={{ borderRadius: 12, marginTop: 5 }}
                        segments={4}
                        yLabelsOffset={5}
                    />
                </View>
            ) : (
                <View style={styles.emptyChart}>
                    <Text style={{ color: "grey", fontSize: 13 }}>
                        Add entries with mood to see your chart 📊
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 10,
        borderRadius: 16,
        padding: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 15,
        gap: 12,
    },
    statBox: {
        flex: 1,
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "bold",
    },
    statLabel: {
        fontSize: 11,
        color: "grey",
        marginTop: 2,
    },
    chartSection: {},
    chartTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    emptyChart: {
        alignItems: "center",
        paddingVertical: 20,
    },
});
