import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ✅ Import Premium Auth Screens
import SplashScreen from "./src/screens/SplashScreen";
import WelcomeScreen from "./src/screens/Auth/WelcomeScreen";
import LoginScreen from "./src/screens/Auth/LoginScreen";
import SignUpStep1 from "./src/screens/Auth/SignUpStep1";
import SignUpStep2 from "./src/screens/Auth/SignUpStep2";
import SignUpStep3 from "./src/screens/Auth/SignUpStep3";
import VerifyCodeScreen from "./src/screens/Auth/VerifyCodeScreen";
import ResetPasswordScreen from "./src/screens/Auth/ResetPasswordScreen";
import ForgotPasswordScreen from "./src/screens/Auth/ForgotPasswordScreen";

// ✅ Import your main app tabs (adjust path if needed)
import MainTabs from "./src/navigation/MainTabs";
import { configureNotifications } from "./src/lib/notification";
import { AppSettingsProvider } from "./src/settings/AppSettingsContext";

// ✅ Navigation Types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUpStep1: undefined;
  SignUpStep2: { fullName: string; email: string };
  SignUpStep3: { fullName: string; email: string; role: string };
  VerifyCode: { email: string };
  ResetPassword: { email: string };
  ForgotPassword: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // ✅ Controls whether to show Splash or Navigation
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    configureNotifications();
  }, []);

  // ✅ Show Splash Screen First
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // ✅ Show Main Navigation After Splash
  return (
    <AppSettingsProvider>
      <SafeAreaProvider>
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
            <Stack.Screen name="SignUpStep1" component={SignUpStep1} />
            <Stack.Screen name="SignUpStep2" component={SignUpStep2} />
            <Stack.Screen name="SignUpStep3" component={SignUpStep3} />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppSettingsProvider>
  );
}
