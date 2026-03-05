import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainTabs from "./src/navigation/MainTabs";
import { initDatabase } from "./src/db/init";

export default function App() {

  initDatabase();
  
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}