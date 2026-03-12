import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabs from "./src/navigation/MainTabs";
import NewTaskScreen from "./src/screens/NewTaskScreen";
import { initDatabase } from "./src/db/init";

import * as Notifications from "expo-notifications";

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {

  initDatabase();

  const requestPermission = async () => {
    await Notifications.requestPermissionsAsync();
  };

  requestPermission();

}, []);

  return (
    <NavigationContainer>

      <Stack.Navigator>

        <Stack.Screen
          name="Home"
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
  );
}