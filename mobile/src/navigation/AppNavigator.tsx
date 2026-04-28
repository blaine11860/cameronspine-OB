import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import TimelineScreen from "../screens/TimelineScreen";
import SymptomsScreen from "../screens/SymptomsScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ForumScreen from "../screens/ForumScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SupplementsScreen from "../screens/SupplementsScreen";

import { useTranslation } from "../lib/i18n";
import { COLORS } from "../lib/theme";

export type RootTabParamList = {
  Home: undefined;
  Timeline: undefined;
  Symptoms: undefined;
  Messages: undefined;
  Forum: undefined;
  Supplements: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICONS: Record<string, string> = {
  Home: "🏠",
  Timeline: "📅",
  Symptoms: "🩺",
  Messages: "💬",
  Forum: "👥",
  Supplements: "💊",
  Profile: "👤",
};

export default function AppNavigator() {
  const { t } = useTranslation();

  const LABELS: Record<string, string> = {
    Home: t.home,
    Timeline: t.timeline,
    Symptoms: t.symptomsNav,
    Messages: t.messages,
    Forum: t.forum,
    Supplements: t.supplements,
    Profile: t.profile,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>
            {ICONS[route.name]}
          </Text>
        ),
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              fontSize: 10,
              color: focused ? COLORS.roseDeep : COLORS.textLight,
              fontWeight: focused ? "600" : "400",
              marginBottom: 2,
            }}
          >
            {LABELS[route.name]}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: 64,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.roseDeep,
        tabBarInactiveTintColor: COLORS.textLight,
        headerStyle: {
          backgroundColor: COLORS.white,
          borderBottomColor: COLORS.border,
          shadowOpacity: 0,
          elevation: 1,
        },
        headerTintColor: COLORS.textDark,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Timeline" component={TimelineScreen} />
      <Tab.Screen name="Symptoms" component={SymptomsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Forum" component={ForumScreen} />
      <Tab.Screen name="Supplements" component={SupplementsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
