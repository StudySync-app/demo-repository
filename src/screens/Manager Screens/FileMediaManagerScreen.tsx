import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { deleteMedia, getMedia, type MediaItem } from "../../db/media";
import { isContentTagged, toggleContentTag } from "../../db/tags";
import { addFolder, getFolders } from "../../db/folders";
import { CreateFolderSheet } from "../../components/CreateFolderSheet";
import { useAppSettings } from "../../settings/AppSettingsContext";
import { openFileUri } from "../../lib/openFile";

export default function FileMediaManagerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isLight, textScale } = useAppSettings();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "audio">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);
  const [openingId, setOpeningId] = useState<number | null>(null);

  const load = useCallback(() => {
    setItems(getMedia());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const displayed = useMemo(() => {
    return items
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sort === "newest" ? bTime - aTime : aTime - bTime;
      });
  }, [items, sort, typeFilter]);

  const openMedia = async (item: MediaItem) => {
    if (!item.uri) return;
    try {
      setOpeningId(item.id);
      await openFileUri(item.uri);
    } catch {
      Alert.alert("Preview unavailable", "This file cannot be opened from its saved location.");
    } finally {
      setOpeningId(null);
    }
  };

  const removeMedia = (item: MediaItem) => {
    Alert.alert("Delete media", `Remove "${item.name || "media file"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMedia(item.id);
          load();
        },
      },
    ]);
  };

  const handleCreateFolder = async (name: string, category: string) => {
    try {
      await addFolder(name.trim(), category || "Media");
      setFolderSheetVisible(false);
      navigation.navigate("FolderedMediaManager");
    } catch {
      Alert.alert("Folder error", "Could not create the folder.");
    }
  };

  return (
    <View style={[
      styles.container,
      isLight && styles.lightContainer,
      { paddingTop: insets.top, paddingBottom: insets.bottom }
    ]}>
      <CreateFolderSheet
        isVisible={folderSheetVisible}
        onClose={() => setFolderSheetVisible(false)}
        onCreate={handleCreateFolder}
        folders={getFolders()}
      />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={28} color={isLight ? "#0F172A" : "#FFF"} />
          </TouchableOpacity>
          <Text style={[styles.title, isLight && styles.lightText, { fontSize: 24 * textScale }]}>My Media</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setFolderSheetVisible(true)}>
          <MaterialIcons name="create-new-folder" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {(["all", "image", "video", "audio"] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.chip, typeFilter === filter && styles.chipActive]}
            onPress={() => setTypeFilter(filter)}
          >
            <Text style={[styles.chipText, typeFilter === filter && styles.chipTextActive]}>
              {filter === "all" ? "All" : filter[0].toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.chip} onPress={() => setSort(sort === "newest" ? "oldest" : "newest")}>
          <Text style={styles.chipText}>{sort === "newest" ? "Newest" : "Oldest"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {displayed.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="perm-media" size={48} color="#1F2A43" />
            <Text style={[styles.emptyText, isLight && styles.lightMuted]}>No media files found.</Text>
          </View>
        ) : (
          displayed.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.card, isLight && styles.lightCard]} onPress={() => openMedia(item)}>
              {item.type === "image" && item.uri ? (
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              ) : (
                <View style={styles.thumbnail}>
                  {openingId === item.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialIcons
                    name={item.type === "video" ? "play-circle-outline" : "audiotrack"}
                    size={34}
                    color="#FFFFFF"
                  />}
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={[styles.name, isLight && styles.lightText]} numberOfLines={1}>{item.name || "Untitled media"}</Text>
                <Text style={styles.meta}>{item.type || "file"} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "No date"}</Text>
              </View>
              <TouchableOpacity onPress={() => removeMedia(item)} hitSlop={10}>
                <MaterialIcons name="delete-outline" size={24} color="#F87171" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                toggleContentTag("media", item.id);
                load();
              }} hitSlop={10}>
                <MaterialIcons name="bookmark" size={24} color={isContentTagged("media", item.id) ? "#60A5FA" : "#FFFFFF"} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
  },
  lightContainer: { backgroundColor: "#F4F7FB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  lightText: { color: "#0F172A" },
  lightMuted: { color: "#64748B" },
  actionBtn: { backgroundColor: "#1F2A43", padding: 8, borderRadius: 8 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginBottom: 10 },
  chip: { backgroundColor: "#1F2A43", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  chipActive: { backgroundColor: "#4B76E7" },
  chipText: { color: "#94A3B8", fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: "#FFFFFF" },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { color: "#94A3B8", marginTop: 12, fontSize: 16 },
  card: { backgroundColor: "#111827", borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  lightCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE4F0" },
  thumbnail: { width: 58, height: 58, borderRadius: 14, backgroundColor: "#1F2A43", justifyContent: "center", alignItems: "center" },
  cardBody: { flex: 1 },
  name: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  meta: { color: "#94A3B8", marginTop: 4, fontSize: 12, textTransform: "capitalize" },
  headerActions: { flexDirection: "row", gap: 10 },
  headerRight: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 },
});
