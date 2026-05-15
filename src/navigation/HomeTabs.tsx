import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "../screens/DashboardScreen";
import TasksScreen from "../screens/TasksScreen";
import FileTasksManagerScreen from "../screens/Manager Screens/FileTasksManagerScreen";
import FileNotesManageScreen from "../screens/Manager Screens/FileNotesManageScreen";
import FolderedTasksManagerScreen from "../screens/Manager Screens/FolderedTasksManagerScreen";
import FolderedNotesManagerScreen from "../screens/Manager Screens/FolderedNotesManagerScreen";
import FileMediaManagerScreen from "../screens/Manager Screens/FileMediaManagerScreen";
import FolderedMediaManagerScreen from "../screens/Manager Screens/FolderedMediaManagerScreen";
import TaggedMediaManagerScreen from "../screens/Manager Screens/TaggedMediaManagerScreen";
import TaggedTaskManagerScreen from "../screens/Manager Screens/TaggedTaskManagerScreen";
import TaggedNotesManagerScreen from "../screens/Manager Screens/TaggedNotesManagerScreen";
import NoteScreen from "../screens/NotesScreen";

const Stack = createNativeStackNavigator();

export default function HomeTabs() {
  return (
    <Stack.Navigator id="HomeStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="TasksScreen" component={TasksScreen} />
      <Stack.Screen name="FileTaskManager" component={FileTasksManagerScreen} />
      <Stack.Screen name="FileNotesManager" component={FileNotesManageScreen} />
      <Stack.Screen name="FolderedTaskManager" component={FolderedTasksManagerScreen} />
      <Stack.Screen name="FolderedNotesManager" component={FolderedNotesManagerScreen} />
      <Stack.Screen name="FileMediaManager" component={FileMediaManagerScreen} />
      <Stack.Screen name="FolderedMediaManager" component={FolderedMediaManagerScreen} />
      <Stack.Screen name="TaggedMediaManager" component={TaggedMediaManagerScreen} />
      <Stack.Screen name="TaggedTaskManager" component={TaggedTaskManagerScreen} />
      <Stack.Screen name="TaggedNotesManager" component={TaggedNotesManagerScreen} />
      <Stack.Screen name="NoteScreen" component={NoteScreen} />
    </Stack.Navigator>
  );
}
