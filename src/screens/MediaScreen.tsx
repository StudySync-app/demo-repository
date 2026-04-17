import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { addMedia, getMedia, deleteMedia } from "../db/media";

export default function MediaScreen() {

  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = () => {
    const data = getMedia();
    setMedia(data);
  };

  // 📸 IMAGE + VIDEO PICKER
  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const type = asset.type || "image";

      addMedia(
        asset.fileName || `media_${Date.now()}`,
        asset.uri,
        type
      );

      loadMedia();
    }
  };



  return (
    <View style={styles.container}>

      <Text style={styles.title}>Media</Text>

      <Button title="Upload Image" onPress={pickMedia} />

      <FlatList
        data={media}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (

          <View style={styles.card}>

            {/* IMAGE */}
            {item.type === "image" && (
              <Image
                source={{ uri: item.uri }}
                style={styles.media}
              />
            )}



            {/* DELETE BUTTON */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                deleteMedia(item.id);
                loadMedia();
              }}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>

          </View>

        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0F172A"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10
  },

  card: {
    marginVertical: 10,
    backgroundColor: "#1E293B",
    padding: 10,
    borderRadius: 12
  },

  media: {
    width: "100%",
    height: 200,
    borderRadius: 10
  },

  audio: {
    color: "#38BDF8",
    fontSize: 16,
    marginVertical: 10
  },

  deleteBtn: {
    marginTop: 10,
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 8,
    alignItems: "center"
  },

  deleteText: {
    color: "#fff",
    fontWeight: "600"
  }
});