import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MainTabs from "./src/navigation/MainTabs";
import NewTaskScreen from "./src/screens/NewTaskScreen";
import { initDatabase } from "./src/db/init";

import * as Notifications from "expo-notifications";

// New Auth Screen Imports
import WelcomeScreen from "./src/screens/Auth/WelcomeScreen";
import LoginScreen from "./src/screens/Auth/LoginScreen";
import SignUpStep1 from "./src/screens/Auth/SignUpStep1";
import SignUpStep2 from "./src/screens/Auth/SignUpStep2";
import SignUpStep3 from "./src/screens/Auth/SignUpStep3";

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    initDatabase();

    const requestPermission = async () => {
      await Notifications.requestPermissionsAsync();
    };

    requestPermission();
    
    // Session clearing code removed to stop network errors

  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          
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

          <Stack.Screen
            name="NewTask"
            component={NewTaskScreen}
            options={{ title: "Create Task" }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}