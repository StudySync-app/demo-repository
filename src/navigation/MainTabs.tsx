import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import DashboardScreen from "../screens/DashboardScreen";
import TasksScreen from "../screens/TasksScreen";
import NotesScreen from "../screens/NotesScreen";
import MediaScreen from "../screens/MediaScreen";
import SettingsTabs from "./SettingsTabs";
//import FoldersScreen from "../screens/FoldersScreen";

import { COLORS } from "../constants/theme";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "To dos") iconName = "check-box";
          else if (route.name === "Notes") iconName = "description";
          else if (route.name === "Media") iconName = "image";
          else if (route.name === "Me") iconName = "settings";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="To dos" component={TasksScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Media" component={MediaScreen} />
      <Tab.Screen name="Me" component={SettingsTabs} />
    </Tab.Navigator>
  );
}