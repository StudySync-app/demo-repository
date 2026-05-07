import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Animated,
  PanResponder
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Added for nav adjustment
import * as ImagePicker from "expo-image-picker";
import { addMedia } from "../db/media";

interface MediaImportSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function MediaImportSheet({ isVisible, onClose }: MediaImportSheetProps) {
  const [selectedType, setSelectedType] = useState("All");
  const insets = useSafeAreaInsets(); // Get system navigation height
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (Math.abs(gestureState.dy) < 5) {
          onClose();
          return;
        }
        if (gestureState.dy > 100) {
          onClose();
          setTimeout(() => pan.setValue({ x: 0, y: 0 }), 300);
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const type = asset.type === "video" ? "video" : "image";
      const name = asset.fileName?.trim() || `Media ${Date.now()}`;
      addMedia(name, asset.uri, type);
      onClose(); 
    }
  };

  const filters = ["Audios", "Videos", "Images", "All"];

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View 
            style={[
              styles.sheet, 
              { 
                transform: [{ translateY: pan.y }],
                // This line pushes the sheet contents above the phone navigation
                paddingBottom: insets.bottom + 16 
              }
            ]}
          >
            <View 
              style={styles.handleContainer} 
              {...panResponder.panHandlers}
            >
              <View style={styles.handle} />
            </View>

            <TouchableWithoutFeedback>
              <View>
                <Text style={styles.heading}>Import your media files here.</Text>
                <Text style={styles.subtitle}>Choose any of the options below.</Text>

                <View style={styles.filterRow}>
                  {filters.map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filterButton, selectedType === filter && styles.filterButtonActive]}
                      onPress={() => setSelectedType(filter)}
                    >
                      <Text style={[styles.filterText, selectedType === filter && styles.filterTextActive]}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.importButton} onPress={pickMedia}>
                  <Text style={styles.importText}>Import</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    paddingHorizontal: 24,
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  handleContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#334155",
    borderRadius: 10,
  },
  heading: { color: "#FFFFFF", fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#A3AED0", fontSize: 15, lineHeight: 22, marginBottom: 24 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  filterButton: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#1E293B", borderRadius: 14 },
  filterButtonActive: { backgroundColor: "#3B82F6" },
  filterText: { color: "#94A3B8", fontSize: 14, fontWeight: "600" },
  filterTextActive: { color: "#FFFFFF" },
  importButton: { backgroundColor: "#2563EB", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  importText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});