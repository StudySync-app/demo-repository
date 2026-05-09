import React, { useCallback, useMemo, useState } from "react";
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getFolders, type Folder } from "../../db/folders";
import { deleteMedia, getMedia, updateMediaFolder, type MediaItem } from "../../db/media";

export default function FolderedMediaManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);

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
        }))
        .filter((group) => group.items.length > 0),
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

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foldered media</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {grouped.length === 0 ? (
          <Text style={styles.emptyText}>No media is inside folders yet. Select or create a folder from the Media import sheet.</Text>
        ) : (
          grouped.map(({ folder, items }) => (
            <View key={folder.id} style={styles.folderBlock}>
              <Text style={styles.folderName}>{folder.name}</Text>
              {items.map((item) => (
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
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816" },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  folderBlock: { marginBottom: 18 },
  folderName: { color: "#58A6FF", fontSize: 16, fontWeight: "800", marginBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#111827", borderRadius: 18, padding: 12, marginBottom: 10 },
  thumb: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#1F2A43" },
  thumbFallback: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  iconButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
});
