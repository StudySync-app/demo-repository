import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NoteScreen from "../screens/NotesScreen";
import FileNotesManagerScreen from "../screens/Manager Screens/FileNotesManageScreen";

const Stack = createNativeStackNavigator();

export default function NoteCards() {
  return (
    <Stack.Navigator>
      {/* ADD THIS LINE - The 'name' must match exactly what you used in navigate() */}
      <Stack.Screen  name="NoteScreen" component={NoteScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
