// app/navigation/AppNavigator.tsx
import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../app/screens/HomeScreen";
import CameraScreen from "../app/screens/CameraScreen";
import HistoryScreen from "../app/screens/HistoryScreen";
import PracticeScreen from "../app/screens/PracticeScreen";
import SettingsScreen from "../app/screens/SettingsScreen";
import CameraHistoryScreen from "../app/screens/CameraHistoryScreen";
import PracticeHistoryScreen from "../app/screens/PracticeHistoryScreen";
import AnswerScreen from "@/app/screens/AnswerScreen";

// Tab & Stack Types
type TabParamList = {
  HomeScreen: undefined;
  CameraScreen: undefined;
  HistoryScreen: undefined;
  PracticeScreen: undefined;
  SettingsScreen: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  CameraHistoryScreen: undefined;
  PracticeHistoryScreen: undefined;
  AnswerScreen: { questions: any[] };
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapped Tabs with SafeAreaInsets
function Tabs() {
  const insets = useSafeAreaInsets();

  return (
  <Tab.Navigator
    screenOptions={({ route }: { route: { name: keyof TabParamList } }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: "#0B0B0C",
        borderTopWidth: 0,
        height: 20 + insets.bottom,
        paddingBottom: insets.bottom,
      },
      tabBarItemStyle: {
        justifyContent: "center",
        alignItems: "center",
      },
      tabBarIcon: ({ focused }: { focused: boolean }) => {
        let iconSource: ImageSourcePropType;

        switch (route.name) {
          case "HomeScreen":
            iconSource = require("../assets/images/HOME.png");
            break;
          case "CameraScreen":
            iconSource = require("../assets/images/AISOLVE.png");
            break;
          case "HistoryScreen":
            iconSource = require("../assets/images/SOLVHIS.png");
            break;
          case "PracticeScreen":
            iconSource = require("../assets/images/PRACQUES.png");
            break;
          case "SettingsScreen":
            iconSource = require("../assets/images/SETTINGS.png");
            break;
          default:
            iconSource = require("../assets/images/HOME.png");
        }

        return (
          <Image
            source={iconSource}
            style={{
              width: 80,
              height: 80,
              opacity: focused ? 1 : 0.6,
              resizeMode: "contain",
            }}
          />
        );
      },
    })}
  >
    {/* Define all tab screens here */}       
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="CameraScreen" component={CameraScreen} />
      <Tab.Screen name="HistoryScreen" component={HistoryScreen} />
      <Tab.Screen name="PracticeScreen" component={PracticeScreen} />
      <Tab.Screen name="SettingsScreen" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="CameraHistoryScreen" component={CameraHistoryScreen} />
        <Stack.Screen name="PracticeHistoryScreen" component={PracticeHistoryScreen} />
        <Stack.Screen name="AnswerScreen" component={AnswerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}




