import React, { useCallback, useMemo, useState } from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getMedia, type MediaItem } from "../../db/media";
import { getTaggedContentIds, toggleContentTag } from "../../db/tags";

export default function TaggedMediaManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [ids, setIds] = useState<Set<number>>(new Set());

  const refresh = useCallback(() => {
    setMedia(getMedia());
    setIds(new Set(getTaggedContentIds("media")));
  }, []);

  useFocusEffect(refresh);

  const taggedMedia = useMemo(() => media.filter((item) => ids.has(item.id)), [ids, media]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tagged media</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {taggedMedia.length === 0 ? (
          <Text style={styles.emptyText}>No tagged media yet.</Text>
        ) : (
          taggedMedia.map((item) => (
            <View key={item.id} style={styles.card}>
              {item.type === "image" && item.uri ? (
                <Image source={{ uri: item.uri }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbFallback}>
                  <MaterialIcons name={item.type === "video" ? "movie" : "audiotrack"} size={24} color="#58A6FF" />
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
                toggleContentTag("media", item.id);
                refresh();
              }} style={styles.iconButton}>
                <MaterialIcons name="bookmark-remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
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
  card: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#111827", borderRadius: 18, padding: 12, marginBottom: 10 },
  thumb: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#1F2A43" },
  thumbFallback: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  iconButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
});
