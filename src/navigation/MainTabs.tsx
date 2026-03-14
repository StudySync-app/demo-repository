import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../screens/DashboardScreen";
import TasksScreen from "../screens/TasksScreen";
import NotesScreen from "../screens/NotesScreen";
import MediaScreen from "../screens/MediaScreen";
import SettingsScreen from "../screens/SettingsScreen";
import FoldersScreen from "../screens/FoldersScreen";

import { COLORS } from "../constants/theme";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Dashboard") iconName = "home";
          else if (route.name === "Tasks") iconName = "checkbox";
          else if (route.name === "Notes") iconName = "document-text";
          else if (route.name === "Media") iconName = "images";
          else if (route.name === "Folders") iconName = "folder";
          else if (route.name === "Settings") iconName = "settings";

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Media" component={MediaScreen} />
      <Tab.Screen name="Folders" component={FoldersScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}