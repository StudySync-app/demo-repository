import React, { useState, useCallback } from "react";
import { View, Text, Button, Image, ScrollView, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";

import { addMedia, getMedia, deleteMedia } from "../db/media";
import { COLORS, SPACING, RADIUS } from "../constants/theme";

export default function MediaScreen() {

  const [mediaItems, setMediaItems] = useState<any[]>([]);

  const loadMedia = () => {
    const data = getMedia();
    setMediaItems(data);
  };

  const pickImage = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });

    if (!result.canceled) {

      const asset = result.assets[0];

      addMedia(
        asset.fileName || "image",
        asset.uri,
        "image"
      );

      loadMedia();
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMedia();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Media</Text>

      <Button title="Upload Image" onPress={pickImage} />

      {mediaItems.map((item) => (

        <View key={item.id} style={styles.card}>

          <Image
            source={{ uri: item.uri }}
            style={styles.image}
          />

          <Button
            title="Delete"
            onPress={() => {
              deleteMedia(item.id);
              loadMedia();
            }}
          />

        </View>

      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: SPACING.screen,
    backgroundColor: COLORS.background
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.text
  },

  card: {
    backgroundColor: COLORS.card,
    padding: SPACING.card,
    borderRadius: RADIUS.card,
    marginTop: 12,
    elevation: 2
  },

  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10
  }

});