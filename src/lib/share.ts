import { Share } from "react-native";

export async function shareContent(title: string, content: string) {
  try {
    await Share.share({
      message: `${title}\n\n${content}`
    });
  } catch (error) {
    console.log("Share error:", error);
  }
}