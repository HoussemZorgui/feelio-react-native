import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StatusBar } from "react-native";
import HomeTabs from "./components/Tabs";
import Diary from "./screens/Diary";
import Edit from "./screens/Edit";
import { DContexts } from "./contexts/DContexts";
import CreatePin from "./screens/CreatePin";
import { initializeDatabase } from "./constants/Database";
import SecureStoreModel from "./constants/SecureStoreModel";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import ValidatePin from "./screens/ValidatePin";
import EditUsername from "./screens/EditUsername";
import EditPin from "./screens/EditPin";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import NotificationService from "./utils/NotificationService";

const Stack = createNativeStackNavigator();
SplashScreen.preventAutoHideAsync();

// Global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [changedsomething, setChangedSomething] = useState("");
  const [primarycolor, setPrimaryColor] = useState("#7856FF");
  const [opacitycolor, setOpacityColor] = useState("#a089ff");
  const [bgcolor, setbgColor] = useState("#f5f5f5");
  const [cardcolor, setCardColor] = useState("white");
  const [txtcolor, settxtColor] = useState("black");
  const [isPinSet, setPinSet] = useState(false);
  const [isUnameSet, setUnameSet] = useState(false);
  const [myuname, setMyUname] = useState("");

  const [fontsLoaded] = useFonts({
    Poppins: require("./assets/fonts/poppins.ttf"),
  });

  // Load colors + request notification permissions + reschedule if needed
  useEffect(() => {
    const init = async () => {
      try {
        const Defaults = {
          primaryColor: "#7856FF",
          opacityColor: "#a089ff",
          bgColor: "#f5f5f5",
          cardColor: "white",
          textColor: "black",
        };

        const [
          loadedPrimaryColor,
          loadedOpacityColor,
          loadedCardColor,
          loadedTextColor,
          loadedUsername,
          loadedBgColor,
        ] = await Promise.all([
          SecureStore.getItemAsync("primarycolor"),
          SecureStore.getItemAsync("opacitycolor"),
          SecureStore.getItemAsync("cardcolor"),
          SecureStore.getItemAsync("textcolor"),
          SecureStore.getItemAsync("username"),
          SecureStore.getItemAsync("bgcolor"),
        ]);

        if (loadedUsername) setMyUname(loadedUsername);

        setPrimaryColor(loadedPrimaryColor ?? Defaults.primaryColor);
        if (!loadedPrimaryColor) await SecureStore.setItemAsync("primarycolor", Defaults.primaryColor);

        setOpacityColor(loadedOpacityColor ?? Defaults.opacityColor);
        if (!loadedOpacityColor) await SecureStore.setItemAsync("opacitycolor", Defaults.opacityColor);

        setbgColor(loadedBgColor ?? Defaults.bgColor);
        if (!loadedBgColor) await SecureStore.setItemAsync("bgcolor", Defaults.bgColor);

        setCardColor(loadedCardColor ?? Defaults.cardColor);
        if (!loadedCardColor) await SecureStore.setItemAsync("cardcolor", Defaults.cardColor);

        settxtColor(loadedTextColor ?? Defaults.textColor);
        if (!loadedTextColor) await SecureStore.setItemAsync("textcolor", Defaults.textColor);

        // Request notification permissions (non-blocking)
        await NotificationService.requestPermissions();

        // Re-schedule reminder if it was previously enabled
        const saved = await NotificationService.getSavedReminderTime();
        if (saved.enabled) {
          await NotificationService.scheduleDailyReminder(saved.hour, saved.minute);
        }
      } catch (error) {
        console.error("Error during init:", error);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    initializeDatabase();
    init();
  }, []);

  useEffect(() => {
    SecureStoreModel.itemExists("pin").then((exists) => {
      if (exists) setPinSet(true);
    });
  }, [isPinSet]);

  useEffect(() => {
    SecureStoreModel.itemExists("username").then((exists) => {
      if (exists) setUnameSet(true);
    });
  }, [isUnameSet]);

  const contextValue = {
    changedsomething, setChangedSomething,
    opacitycolor, setOpacityColor,
    primarycolor, setPrimaryColor,
    cardcolor, setCardColor,
    bgcolor, setbgColor,
    txtcolor, settxtColor,
    setMyUname, myuname,
    isPinSet, setPinSet,
    isUnameSet, setUnameSet,
  };

  if (isUnameSet) {
    if (isPinSet) {
      return (
        <DContexts.Provider value={contextValue}>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  marginTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight,
                },
              }}
            >
              <Stack.Screen name="ValidatePin" component={ValidatePin} options={{ headerShown: false }} />
              <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
              <Stack.Screen name="Diary" component={Diary} options={{ headerShown: false }} />
              <Stack.Screen name="Edit" component={Edit} options={{ headerShown: false }} />
              <Stack.Screen name="EditPin" component={EditPin} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </DContexts.Provider>
      );
    } else {
      return (
        <DContexts.Provider value={contextValue}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="CreatePin" component={CreatePin} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </DContexts.Provider>
      );
    }
  } else {
    return (
      <DContexts.Provider value={contextValue}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="EditUsername" component={EditUsername} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </DContexts.Provider>
    );
  }
}
