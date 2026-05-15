import React, { useState } from "react";import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Text, Image } from "react-native";

import TasksScreen from "../screens/TasksScreen";
import NotesScreen from "../screens/NotesScreen";
import SettingsTabs from "./SettingsTabs";
import MediaImportSheet from "../components/MediaImportSheet"; 
import HomeTabs from "./HomeTabs";
import { COLORS } from "../constants/theme";

import { useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

import { DeviceEventEmitter } from "react-native";
import { useAppSettings } from "../settings/AppSettingsContext";

const Tab = createBottomTabNavigator();

// Placeholder so the tab exists but renders nothing
const Placeholder = () => null;



export default function MainTabs() {
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { isLight, textScale } = useAppSettings();
  
  useEffect(() => {
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
const url = data.user?.user_metadata?.avatar_url;
setProfileImage(url ? url + "?t=" + Date.now() : null);  };
  loadUser();
}, []);

useFocusEffect(
  React.useCallback(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
const url = data.user?.user_metadata?.avatar_url;
setProfileImage(url ? url + "?t=" + Date.now() : null);    };
    loadUser();
  }, [])
);

useEffect(() => {
  const subscription = DeviceEventEmitter.addListener("avatarUpdated", (url) => {
    setProfileImage(url + "?t=" + Date.now());
  });

  return () => subscription.remove();
}, []);

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

            return (
  <Image
    key={profileImage} 
    source={
      route.name === "Me"
        ? profileImage
          ? { uri: profileImage }
          : require("../../assets/nav_home.png") // fallback
        : route.name === "Home"
        ? require("../../assets/nav_home.png")
        : route.name === "To dos"
        ? require("../../assets/nav_todo.png")
        : route.name === "Notes"
        ? require("../../assets/nav_notes.png")
        : require("../../assets/nav_media.png")
    }
    style={{
      width: route.name === "Me" ? 28 : 24,
      height: route.name === "Me" ? 28 : 24,
      borderRadius: route.name === "Me" ? 14 : 0,
      resizeMode: route.name === "Me" ? "cover" : "contain",
      tintColor: route.name === "Me" ? undefined : color,
    }}
  />
);
                
          },
          // 2. Handle Label Color
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarItemStyle: {
            paddingBottom: 5,
          },

          tabBarLabel: ({ children, color }) => {
            const activeColor = (route.name === "Media" && isSheetVisible) 
              ? COLORS.primary 
              : color;
            return (
              <Text style={{ color: activeColor, fontSize: 10 * textScale, fontWeight: '600' }}>
                {children}
              </Text>
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: isLight ? "#64748B" : "white",
          
          tabBarStyle: {
            backgroundColor: isLight ? "#FFFFFF" : "#1A2535",
            borderTopWidth: 0,
            elevation: 0,
            height: 120,
            paddingTop:14,
            paddingBottom:12,
          },

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
