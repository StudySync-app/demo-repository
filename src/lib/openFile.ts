import { Linking, Platform } from "react-native";
import { File } from "expo-file-system";

export async function openFileUri(uri?: string | null) {
  if (!uri) return;

  const safeUri = Platform.OS === "android" && uri.startsWith("file://")
    ? new File(uri).contentUri
    : uri;

  const canOpen = await Linking.canOpenURL(safeUri);
  if (!canOpen) {
    throw new Error("No app is available to open this file.");
  }

  await Linking.openURL(safeUri);
}
