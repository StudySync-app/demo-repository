import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Text } from "react-native";

import TasksScreen from "../screens/TasksScreen";
import NotesScreen from "../screens/NotesScreen";
import SettingsTabs from "./SettingsTabs";
import MediaImportSheet from "../components/MediaImportSheet"; 
import HomeTabs from "./HomeTabs";
import { COLORS } from "../constants/theme";

const Tab = createBottomTabNavigator();

// Placeholder so the tab exists but renders nothing
const Placeholder = () => null;

export default function MainTabs() {
  const [isSheetVisible, setSheetVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          // 1. Handle Icon Color
          tabBarIcon: ({ color, size }) => {
            let iconName: any;
            // If sheet is open and this is the Media tab, force the primary color
            const activeColor = (route.name === "Media" && isSheetVisible) 
              ? COLORS.primary 
              : color;

            if (route.name === "Home") iconName = "home";
            else if (route.name === "To dos") iconName = "check-box";
            else if (route.name === "Notes") iconName = "description";
            else if (route.name === "Media") iconName = "image";
            else if (route.name === "Me") iconName = "settings";

            return <MaterialIcons name={iconName} size={size} color={activeColor} />;
          },
          // 2. Handle Label Color
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarItemStyle: {
            paddingBottom: 5,
          },
          // This function ensures the text label also turns blue
          tabBarLabel: ({ children, color }) => {
            const activeColor = (route.name === "Media" && isSheetVisible) 
              ? COLORS.primary 
              : color;
            return (
              <Text style={{ color: activeColor, fontSize: 10, fontWeight: '600' }}>
                {children}
              </Text>
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Home" component={HomeTabs} />
        <Tab.Screen name="To dos" component={TasksScreen} />
        <Tab.Screen name="Notes" component={NotesScreen} />
        
        <Tab.Screen 
          name="Media" 
          component={Placeholder} 
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // Stop navigation
              setSheetVisible(true); // Show the sheet
            },
          }}
        />
        
        <Tab.Screen name="Me" component={SettingsTabs} />
      </Tab.Navigator>

      {/* The Bottom Sheet */}
      <MediaImportSheet 
        isVisible={isSheetVisible} 
        onClose={() => setSheetVisible(false)} 
      />
    </>
  );
}
