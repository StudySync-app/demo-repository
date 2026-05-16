import React, { useCallback, useMemo, useState } from "react";
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { addFolder, getFolders, type Folder } from "../../db/folders";
import { deleteMedia, getMedia, updateMediaFolder, type MediaItem } from "../../db/media";
import { CreateFolderSheet } from "../../components/CreateFolderSheet";

export default function FolderedMediaManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [expandedFolderId, setExpandedFolderId] = useState<number | null>(null);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);

  const refresh = useCallback(() => {
    setFolders(getFolders());
    setMedia(getMedia());
  }, []);

  useFocusEffect(refresh);

  const grouped = useMemo(
    () =>
      folders
        .map((folder) => ({
          folder,
          items: media.filter((item) => item.folderId === folder.id),
        })),
    [folders, media]
  );

  const confirmDelete = (item: MediaItem) => {
    Alert.alert("Delete media", `Remove "${item.name || "Media"}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        deleteMedia(item.id);
        refresh();
      }},
    ]);
  };

  const handleCreateFolder = async (name: string, category: string) => {
    try {
      const folderId = await addFolder(name.trim(), category || "Media");
      setExpandedFolderId(folderId);
      setFolderSheetVisible(false);
      refresh();
    } catch {
      Alert.alert("Folder error", "Could not create the folder.");
    }
  };

  const handleAddMedia = (folder: Folder) => {
    const availableMedia = media.filter((item) => item.folderId !== folder.id);
    if (availableMedia.length === 0) {
      Alert.alert("No media available", "All media files are already inside this folder.");
      return;
    }

    Alert.alert("Add media to folder", folder.name, [
      ...availableMedia.slice(0, 8).map((item) => ({
        text: item.name || "Media file",
        onPress: () => {
          updateMediaFolder(item.id, folder.id);
          setExpandedFolderId(folder.id);
          refresh();
        },
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <CreateFolderSheet
        isVisible={folderSheetVisible}
        onClose={() => setFolderSheetVisible(false)}
        onCreate={handleCreateFolder}
        folders={folders}
      />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Foldered media</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => setFolderSheetVisible(true)}>
          <MaterialIcons name="create-new-folder" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {folders.length === 0 ? (
          <Text style={styles.emptyText}>No media folders yet. Create a folder from the media manager.</Text>
        ) : (
          grouped.map(({ folder, items }) => (
            <View key={folder.id} style={styles.folderBlock}>
              <TouchableOpacity
                style={styles.folderHeader}
                activeOpacity={0.85}
                onPress={() => setExpandedFolderId((current) => current === folder.id ? null : folder.id)}
              >
                <MaterialIcons name={expandedFolderId === folder.id ? "folder-open" : "folder"} size={26} color="#58A6FF" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.folderName}>{folder.name}</Text>
                  <Text style={styles.folderCount}>{items.length} file{items.length === 1 ? "" : "s"}</Text>
                </View>
                <TouchableOpacity style={styles.folderActionButton} onPress={() => handleAddMedia(folder)}>
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <MaterialIcons name={expandedFolderId === folder.id ? "expand-less" : "expand-more"} size={22} color="#94A3B8" />
              </TouchableOpacity>

              {expandedFolderId === folder.id ? (
                items.length === 0 ? (
                  <Text style={styles.folderEmptyText}>This folder is empty and ready for media.</Text>
                ) : (
                  items.map((item) => (
                    <View key={item.id} style={styles.card}>
                      {item.type === "image" && item.uri ? <Image source={{ uri: item.uri }} style={styles.thumb} /> : (
                        <View style={styles.thumbFallback}>
                          <MaterialIcons name={item.type === "video" ? "movie" : "insert-drive-file"} size={24} color="#58A6FF" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.name || "Media file"}</Text>
                        <Text style={styles.cardSubtitle}>{item.type || "file"}</Text>
                      </View>
                      {item.uri ? (
                        <TouchableOpacity onPress={() => Linking.openURL(item.uri!)} style={styles.iconButton}>
                          <MaterialIcons name="open-in-new" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity onPress={() => {
                        updateMediaFolder(item.id, null);
                        refresh();
                      }} style={styles.iconButton}>
                        <MaterialIcons name="folder-off" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.iconButton}>
                        <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))
                )
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 8 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  folderBlock: { marginBottom: 18 },
  folderHeader: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  folderName: { color: "#58A6FF", fontSize: 16, fontWeight: "800" },
  folderCount: { color: "#94A3B8", fontSize: 12, marginTop: 3 },
  folderActionButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#4B76E7", alignItems: "center", justifyContent: "center" },
  folderEmptyText: { color: "#94A3B8", backgroundColor: "#0B1220", borderRadius: 14, padding: 14, marginBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#111827", borderRadius: 18, padding: 12, marginBottom: 10 },
  thumb: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#1F2A43" },
  thumbFallback: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  iconButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
});
