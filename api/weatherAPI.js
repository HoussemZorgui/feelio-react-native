import axios from "axios";

// OpenWeatherMap free API – 1000 calls/day
// Get your free key at: https://openweathermap.org/api
const OWM_API_KEY = "8d2de98e089f1c28e1a22fc19a24ef04"; // Demo key – replace with yours

const WEATHER_EMOJIS = {
  "01d": "☀️", "01n": "🌙",
  "02d": "⛅", "02n": "⛅",
  "03d": "☁️", "03n": "☁️",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️",
  "10d": "🌦️", "10n": "🌦️",
  "11d": "⛈️", "11n": "⛈️",
  "13d": "❄️", "13n": "❄️",
  "50d": "🌫️", "50n": "🌫️",
};

export const fetchWeatherData = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: OWM_API_KEY,
          units: "metric",
        },
        timeout: 5000,
      }
    );
    const data = response.data;
    return {
      temp: Math.round(data.main.temp),
      city: data.name,
      country: data.sys.country,
      icon: data.weather[0].icon,
      emoji: WEATHER_EMOJIS[data.weather[0].icon] || "🌡️",
      description: data.weather[0].description,
    };
  } catch (error) {
    console.log("Could not fetch weather:", error.message);
    return null;
  }
};
