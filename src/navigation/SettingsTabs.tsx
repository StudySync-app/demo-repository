import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SettingsScreen from "../screens/SettingsScreen";
// removed "Sub" to all the paths below:
import MyAccountScreen from "../screens/Settings Screens/MyAccountScreen";
import PersonalizationScreen from "../screens/Settings Screens/PersonalizationScreen";
import NotificationsScreen from "../screens/Settings Screens/NotificationsScreen";
import SecurityScreens from "../screens/Settings Screens/SecurityScreens";
import StudySyncScreen from "../screens/Settings Screens/StudySyncScreen";
import {
  AIAnswerScreen,
  AIAssistScreen,
  AIQuizScreen,
  AIRemindScreen,
  AISuggestScreen,
  ChangePasswordScreen,
  DisableNotificationsScreen,
  FontSizeScreen,
  LanguageScreen,
  NotificationCategoriesScreen,
  PaymentsScreen,
  PersonalDetailsScreen,
  RecoveryEmailScreen,
  RecoveryPhoneScreen,
  SoundVibrationScreen,
  StorageSyncScreen,
  ThemeModeScreen,
  TwoFactorScreen,
} from "../screens/Settings Screens/SettingsDetailScreens";

const Stack = createNativeStackNavigator();

export default function SettingsTabs() {
  return (
    <Stack.Navigator id="SettingsStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="MyAccount" component={MyAccountScreen} />
      <Stack.Screen name="Personalization" component={PersonalizationScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="DisableNotifications" component={DisableNotificationsScreen} />
      <Stack.Screen name="NotificationCategories" component={NotificationCategoriesScreen} />
      <Stack.Screen name="SoundVibration" component={SoundVibrationScreen} />
      <Stack.Screen name="StorageSync" component={StorageSyncScreen} />
      <Stack.Screen name="Security" component={SecurityScreens} />
      <Stack.Screen name="StudySync" component={StudySyncScreen} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="ThemeMode" component={ThemeModeScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="FontSize" component={FontSizeScreen} />
      <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="RecoveryPhone" component={RecoveryPhoneScreen} />
      <Stack.Screen name="RecoveryEmail" component={RecoveryEmailScreen} />
      <Stack.Screen name="AIQuiz" component={AIQuizScreen} />
      <Stack.Screen name="AIAnswer" component={AIAnswerScreen} />
      <Stack.Screen name="AISuggest" component={AISuggestScreen} />
      <Stack.Screen name="AIAssist" component={AIAssistScreen} />
      <Stack.Screen name="AIRemind" component={AIRemindScreen} />
    </Stack.Navigator>
  );
}
