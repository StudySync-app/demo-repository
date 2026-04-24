import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function MediaScreen() {
  const [selectedType, setSelectedType] = useState("All");

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // Handle selection if needed
      console.log("Picked media", result.assets[0]);
    }
  };

  const filters = ["Audios", "Videos", "Images", "All"];

  return (
    <View style={styles.screen}>
      <View style={styles.overlay} />

      <View style={styles.sheet}>
        <Text style={styles.heading}>Import your media files here.</Text>
        <Text style={styles.subtitle}>
          Choose any of the options below.
        </Text>

        <View style={styles.filterRow}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedType === filter && styles.filterButtonActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setSelectedType(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedType === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.importButton}
          activeOpacity={0.85}
          onPress={pickMedia}
        >
          <Text style={styles.importText}>Import</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050816",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  sheet: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 20,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    color: "#A3AED0",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    minWidth: 72,
    alignItems: "center",
    marginBottom: 12,
  },
  filterButtonActive: {
    backgroundColor: "#374151",
  },
  filterText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  importButton: {
    marginTop: 4,
    backgroundColor: "#2563EB",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  importText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});