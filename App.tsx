import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MainTabs from "./src/navigation/MainTabs";
import { initDatabase } from "./src/db/init";

import * as Notifications from "expo-notifications";
import { migrateDb } from "./src/db/notes";
// Auth Screen Imports
import WelcomeScreen from "./src/screens/Auth/WelcomeScreen";
import LoginScreen from "./src/screens/Auth/LoginScreen";
import ForgotPasswordScreen from "./src/screens/Auth/ForgotPasswordScreen";
import VerifyCodeScreen from "./src/screens/Auth/VerifyCodeScreen"; // ← ADD THIS
import ResetPasswordScreen from "./src/screens/Auth/ResetPasswordScreen"; // ← ADD THIS
import SignUpStep1 from "./src/screens/Auth/SignUpStep1";
import SignUpStep2 from "./src/screens/Auth/SignUpStep2";
import SignUpStep3 from "./src/screens/Auth/SignUpStep3";

// 1. Define the global param list to fix the "Property does not exist" errors
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUpStep1: undefined;
  SignUpStep2: { fullName: string; email: string };
  SignUpStep3: { fullName: string; email: string; role: string };
  ForgotPassword: undefined;
  VerifyCode: undefined;
  ResetPassword: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Initialize the core database
        initDatabase();
  
        // 2. Run your professional migration to add media columns
        await migrateDb();
        console.log("Database initialized and migrated successfully.");
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
  
    const requestPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };
  
    initializeApp();
    requestPermission();
  
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right' // Smooth transition for steps
          }}
        >
          
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          
          {/* Password Reset Flow */}
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="VerifyCode" 
            component={VerifyCodeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ResetPassword" 
            component={ResetPasswordScreen} 
            options={{ headerShown: false }} 
          />
          
          <Stack.Screen 
            name="SignUpStep1" 
            component={SignUpStep1} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="SignUpStep2" 
            component={SignUpStep2} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="SignUpStep3" 
            component={SignUpStep3} 
            options={{ headerShown: false }} 
          />

          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />

        
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}