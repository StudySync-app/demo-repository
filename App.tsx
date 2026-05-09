import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

import MainTabs from "./src/navigation/MainTabs";
import { initDatabase } from "./src/db/init";
import { AppSettingsProvider } from "./src/settings/AppSettingsContext";

import WelcomeScreen from "./src/screens/Auth/WelcomeScreen";
import LoginScreen from "./src/screens/Auth/LoginScreen";
import ForgotPasswordScreen from "./src/screens/Auth/ForgotPasswordScreen";
import VerifyCodeScreen from "./src/screens/Auth/VerifyCodeScreen";
import ResetPasswordScreen from "./src/screens/Auth/ResetPasswordScreen";
import SignUpStep1 from "./src/screens/Auth/SignUpStep1";
import SignUpStep2 from "./src/screens/Auth/SignUpStep2";
import SignUpStep3 from "./src/screens/Auth/SignUpStep3";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  ResetPassword: { email: string };
  SignUpStep1: undefined;
  SignUpStep2: { fullName: string; email: string };
  SignUpStep3: { fullName: string; email: string; role: string };
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    initDatabase();

    const requestPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    };

    requestPermission();
  }, []);

  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="SignUpStep1" component={SignUpStep1} />
            <Stack.Screen name="SignUpStep2" component={SignUpStep2} />
            <Stack.Screen name="SignUpStep3" component={SignUpStep3} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}
