import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { fetchWeatherData } from "../api/weatherAPI";
import { getCurrentLocation } from "../utils/location";
import { DContexts } from "../contexts/DContexts";
import { LinearGradient } from "expo-linear-gradient";
import MoodChart from "./MoodChart";

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { primarycolor, opacitycolor } = useContext(DContexts);

  useEffect(() => {
    const load = async () => {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        const data = await fetchWeatherData(latitude, longitude);
        setWeatherData(data);
      } catch (error) {
        console.log("Dashboard weather unavailable:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <LinearGradient
        colors={[primarycolor, opacitycolor, primarycolor]}
        style={styles.dashboard}
      >
        <View style={styles.dashboardInner}>
          <View style={styles.dashboard_up}>
            <View>
              <Text style={styles.dashboard_label}>Today</Text>
              <Text style={styles.dashboard_date}>{dateStr}</Text>
            </View>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : weatherData ? (
              <View style={styles.weatherBlock}>
                <Text style={styles.weatherEmoji}>{weatherData.emoji}</Text>
                <Text style={styles.weatherTemp}>{weatherData.temp}°C</Text>
                <Text style={styles.weatherCity}>
                  {weatherData.city}, {weatherData.country}
                </Text>
              </View>
            ) : (
              <Text style={styles.weatherNA}>🌡️ N/A</Text>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Mood Analytics below the gradient card */}
      <MoodChart />
    </>
  );
};

const styles = StyleSheet.create({
  dashboard: {
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 18,
    padding: 16,
    elevation: 10,
    shadowColor: "#7856FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dashboardInner: {
    borderRadius: 10,
  },
  dashboard_up: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dashboard_label: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dashboard_date: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  weatherBlock: {
    alignItems: "flex-end",
  },
  weatherEmoji: {
    fontSize: 28,
  },
  weatherTemp: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  weatherCity: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
  },
  weatherNA: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
  },
});

export default Dashboard;
