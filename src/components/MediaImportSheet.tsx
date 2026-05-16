import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  ActivityIndicator,
  View,
  Text,
  TextInput,
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
import { File } from "expo-file-system";
import { addMedia } from "../db/media";
import { notifyNewMedia } from "../lib/notification";

interface MediaImportSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onImported?: () => void;
}

export default function MediaImportSheet({ isVisible, onClose, onImported }: MediaImportSheetProps) {
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const insets = useSafeAreaInsets(); // Get system navigation height
  const pan = useRef(new Animated.ValueXY()).current;


  useEffect(() => {
  }, [isVisible]);

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

  const savePickedMedia = async (name: string, uri: string, type: "image" | "video" | "audio") => {
    setIsImporting(true);
    try {
      addMedia(name, uri, type, selectedFolderId);
      await notifyNewMedia(name);
      onImported?.();
      onClose();
    } finally {
      setIsImporting(false);
    }
  };

  const inferMediaType = (file: File): "image" | "video" | "audio" | null => {
    const mime = file.type || "";
    const name = file.name.toLowerCase();
    if (mime.startsWith("audio/") || /\.(mp3|m4a|wav|aac|ogg|flac)$/.test(name)) return "audio";
    if (mime.startsWith("video/") || /\.(mp4|mov|m4v|webm|avi|mkv)$/.test(name)) return "video";
    if (mime.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|heic)$/.test(name)) return "image";
    return null;
  };

  const pickAudio = async () => {
    try {
      setIsImporting(true);
      const picked = await File.pickFileAsync(undefined, "audio/*");
      const file = Array.isArray(picked) ? picked[0] : picked;
      if (!file) return;
      await savePickedMedia(file.name || `Audio ${Date.now()}`, file.uri, "audio");
    } catch {
      Alert.alert("Audio import failed", "Could not import the selected audio file.");
    } finally {
      setIsImporting(false);
    }
  };

  const pickAnyMediaFile = async () => {
    try {
      setIsImporting(true);
      const picked = await File.pickFileAsync(undefined, "*/*");
      const file = Array.isArray(picked) ? picked[0] : picked;
      if (!file) return;
      const type = inferMediaType(file);
      if (!type) {
        Alert.alert("Unsupported file", "Choose an audio, video, or image file.");
        return;
      }
      await savePickedMedia(file.name || `Media ${Date.now()}`, file.uri, type);
    } catch {
      Alert.alert("Import failed", "Could not import the selected file.");
    } finally {
      setIsImporting(false);
    }
  };

  const pickImageOrVideo = async (filter = selectedType) => {
    const mediaTypes =
      filter === "Videos"
        ? ImagePicker.MediaTypeOptions.Videos
        : filter === "Images"
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.All;

    try {
      setIsImporting(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const type = asset.type === "video" ? "video" : "image";
        const name = asset.fileName?.trim() || `Media ${Date.now()}`;
        await savePickedMedia(name, asset.uri, type);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const pickMedia = async () => {
    if (selectedType === "Audios") {
      await pickAudio();
      return;
    }

    if (selectedType === "All") {
      await pickAnyMediaFile();
      return;
    }

    await pickImageOrVideo(selectedType);
  };

  const handleFilterPress = async (filter: string) => {
    setSelectedType(filter);
    if (filter === "Audios") {
      await pickAudio();
    } else if (filter === "All") {
      await pickAnyMediaFile();
    } else {
      await pickImageOrVideo(filter);
    }
  };

  const filters = ["Audios", "Videos", "Images"];

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
                <Text style={styles.subtitle}>Choose where you want to save below.</Text>
                {isImporting ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading files...</Text>
                  </View>
                ) : null}

                <View style={styles.filterRow}>
                  {filters.map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filterButton, selectedType === filter && styles.filterButtonActive]}
                      onPress={() => handleFilterPress(filter)}
                    >
                      <Text style={[styles.filterText, selectedType === filter && styles.filterTextActive]}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={[styles.importButton, isImporting && styles.importButtonDisabled]} onPress={pickMedia} disabled={isImporting}>
                  {isImporting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.importText}>Import</Text>}
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
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#1E293B", borderRadius: 14, padding: 12, marginBottom: 16 },
  loadingText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  filterButton: { paddingVertical: 10, paddingHorizontal: 31, backgroundColor: "#1E293B", borderRadius: 14 },
  filterButtonActive: { backgroundColor: "#3B82F6" },
  filterText: { color: "#94A3B8", fontSize: 14, fontWeight: "600" },
  filterTextActive: { color: "#FFFFFF" },
  sectionLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", marginBottom: 10 },
  folderRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  folderChip: { backgroundColor: "#1E293B", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: "transparent" },
  folderChipActive: { backgroundColor: "#102A4E", borderColor: "#3B82F6" },
  folderChipText: { color: "#94A3B8", fontSize: 13, fontWeight: "700" },
  folderChipTextActive: { color: "#FFFFFF" },
  createFolderRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  folderInput: { flex: 1, backgroundColor: "#1E293B", color: "#FFFFFF", borderRadius: 14, paddingHorizontal: 14, minHeight: 46 },
  createFolderButton: { backgroundColor: "#334155", borderRadius: 14, paddingHorizontal: 14, justifyContent: "center" },
  createFolderText: { color: "#FFFFFF", fontWeight: "800" },
  importButton: { backgroundColor: "#2563EB", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  importButtonDisabled: { opacity: 0.65 },
  importText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
