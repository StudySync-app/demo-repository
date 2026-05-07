import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SettingsScreen from "../screens/SettingsScreen";
// Add "Sub" to all the paths below:
import MyAccountScreen from "../screens/Settings Sub Screens/MyAccountScreen";
import PersonalizationScreen from "../screens/Settings Sub Screens/PersonalizationScreen";
import NotificationsScreen from "../screens/Settings Sub Screens/NotificationsScreen";
import SecurityScreens from "../screens/Settings Sub Screens/SecurityScreens";
import StudySyncScreen from "../screens/Settings Sub Screens/StudySyncScreen";

const Stack = createNativeStackNavigator();

export default function SettingsTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="MyAccount" component={MyAccountScreen} />
      <Stack.Screen name="Personalization" component={PersonalizationScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Security" component={SecurityScreens} />
      <Stack.Screen name="StudySync" component={StudySyncScreen} />
    </Stack.Navigator>
  );
}
