import React, { useCallback, useMemo, useState } from "react";
import {View,Text,Image,ImageBackground, StyleSheet,ScrollView,TouchableOpacity,useWindowDimensions,Platform} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { HomeCards, CardKind, SectionVariant } from "../components/HomeCards";
import { getTasks, Task } from "../db/tasks";
import { getNotes, Note } from "../db/notes";
import { getMedia, MediaItem } from "../db/media";
import { getTaggedCountsByContentType, getTaggedContentIds } from "../db/tags";
import { SPACING } from "../constants/theme";

type HomeStackParamList = {
  Dashboard: undefined;
  FileTaskManager: undefined;
  FileNotesManager: undefined;
  FileMediaManager: undefined;
  FolderedTaskManager: undefined;
  FolderedNotesManager: undefined;
  FolderedMediaManager: undefined;
  TaggedTaskManager: undefined;
  TaggedNotesManager: undefined;
  TaggedMediaManager: undefined;
};

type HomeStackRouteName = keyof Omit<HomeStackParamList, "Dashboard">;

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "now";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "now";

  const diffSec = Math.floor((Date.now() - then) / 1000);

  if (diffSec < 45) return "now";
  if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))} mins ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour(s) ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)} day(s) ago`;

  return new Date(iso).toLocaleDateString();
}

function latestCreatedAt(items: { createdAt?: string | null }[]): string | null {
  let best: string | null = null;
  let bestMs = 0;

  for (const it of items) {
    if (!it.createdAt) continue;
    const ms = new Date(it.createdAt).getTime();

    if (!Number.isNaN(ms) && ms > bestMs) {
      bestMs = ms;
      best = it.createdAt;
    }
  }

  return best ?? null;
}

const ROUTE_MAP: Record<SectionVariant, Record<CardKind, HomeStackRouteName>> = {
  files: {
    todos: "FileTaskManager",
    notes: "FileNotesManager",
    media: "FileMediaManager"
  },
  folders: {
    todos: "FolderedTaskManager",
    notes: "FolderedNotesManager",
    media: "FolderedMediaManager"
  },
  tagged: {
    todos: "TaggedTaskManager",
    notes: "TaggedNotesManager",
    media: "TaggedMediaManager"
  }
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [tagged, setTagged] = useState({
    tasks: 0,
    notes: 0,
    media: 0
  });

  const refresh = useCallback(async () => {
    const [t, n, m, tag] = await Promise.all([
      getTasks(),
      getNotes(),
      getMedia(),
      getTaggedCountsByContentType()
    ]);

    setTasks(t);
    setNotes(n);
    setMedia(m);
    setTagged(tag);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const tasksInFolders = useMemo(
    () => tasks.filter((t) => t.folderId != null),
    [tasks]
  );

  const notesInFolders = useMemo(
    () => notes.filter((n) => n.folderId != null),
    [notes]
  );

  const mediaInFolders = useMemo(
    () => media.filter((m) => m.folderId != null),
    [media]
  );

  const taggedTaskIds = useMemo(() => new Set(getTaggedContentIds("task")),[]);
  const taggedNoteIds = useMemo(() => new Set(getTaggedContentIds("note")),[]);
  const taggedMediaIds = useMemo(() => new Set(getTaggedContentIds("media")),[]);

  const CARD_W = 118;
  const CARD_H = 112;
  const CARD_GAP = 2;

  const rowInnerWidth = windowWidth - SPACING.screen * 2;
  const needsHorizontalCardScroll = false;

  const { fittedCardWidth, fittedCardHeight } = useMemo(() => {
    if (needsHorizontalCardScroll) {
      return { fittedCardWidth: CARD_W, fittedCardHeight: CARD_H };
    }

    const w = Math.floor((rowInnerWidth - CARD_GAP * 2) / 3);
    const scale = w / CARD_W;

    return {
      fittedCardWidth: w,
      fittedCardHeight: Math.max(96, Math.round(CARD_H * scale))
    };
  }, [needsHorizontalCardScroll, rowInnerWidth]);

  const handlePress = (kind: CardKind, variant: SectionVariant) => {
    const routeName = ROUTE_MAP[variant][kind];
    navigation.navigate(routeName);
  };

  const subtitleMyFiles = (kind: CardKind) => {
    const list =
      kind === "todos" ? tasks :
      kind === "media" ? media :
      notes;

    return list.length === 0
      ? undefined
      : formatRelativeTime(latestCreatedAt(list));
  };

  const subtitleTagged = (kind: CardKind) => {
    const list =
      kind === "todos"
        ? tasks.filter((t) => taggedTaskIds.has(t.id))
        : kind === "media"
        ? media.filter((m) => taggedMediaIds.has(m.id))
        : notes.filter((n) => taggedNoteIds.has(n.id));

    return list.length === 0
      ? undefined
      : formatRelativeTime(latestCreatedAt(list));
  };

  const subtitleFolders = (kind: CardKind) => {
    const list =
      kind === "todos"
        ? tasksInFolders
        : kind === "media"
        ? mediaInFolders
        : notesInFolders;

    return list.length === 0
      ? undefined
      : formatRelativeTime(latestCreatedAt(list));
  };

  return (
    <ImageBackground
    source={require("../../assets/dashboard_bg.png")}
    style={{ flex: 1 }}
    resizeMode="cover"
  >
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32
        }
      ]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={Platform.OS === "android"}
    >
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/studysync_logo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandLetter}>StudySync</Text>
        </View>

        <TouchableOpacity style={styles.searchBtn}>
        <Image
          source={require("../../assets/search.png")}
          style={{
            width: 24,
            height: 24,
            resizeMode: "contain",
          }}
        />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My files</Text>
        <HomeCards
          variant="files"
          counts={{
            todos: tasks.length,
            media: media.length,
            notes: notes.length
          }}
          subtitleFor={subtitleMyFiles}
          fittedCardWidth={fittedCardWidth}
          fittedCardHeight={fittedCardHeight}
          needsHorizontalCardScroll={needsHorizontalCardScroll}
          spacing={SPACING.screen}
          onCardPress={(kind) => handlePress(kind, "files")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tagged files</Text>
        <HomeCards
          variant="tagged"
          counts={{
            todos: tagged.tasks,
            media: tagged.media,
            notes: tagged.notes
          }}
          subtitleFor={subtitleTagged}
          fittedCardWidth={fittedCardWidth}
          fittedCardHeight={fittedCardHeight}
          needsHorizontalCardScroll={needsHorizontalCardScroll}
          spacing={SPACING.screen}
          onCardPress={(kind) => handlePress(kind, "tagged")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My folders</Text>
        <HomeCards
          variant="folders"
          counts={{
            todos: tasksInFolders.length,
            media: mediaInFolders.length,
            notes: notesInFolders.length
          }}
          subtitleFor={subtitleFolders}
          fittedCardWidth={fittedCardWidth}
          fittedCardHeight={fittedCardHeight}
          needsHorizontalCardScroll={needsHorizontalCardScroll}
          spacing={SPACING.screen}
          onCardPress={(kind) => handlePress(kind, "folders")}
        />
      </View>
    </ScrollView>
</ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1},
  contentContainer: { paddingHorizontal: SPACING.screen },
  headerRow: {flexDirection: "row", justifyContent: "space-between", alignItems: "center",marginBottom: 40},
  brandRow: {flexDirection: "row",alignItems: "center"},
  brandLetter: {color: "#fff",fontSize: 22,fontWeight: "700"},
  brandLogo: {height: 44,width: 44,marginRight: 10},
  searchBtn: { width: 42,height: 42,borderRadius: 14,backgroundColor: "#1F2A43",justifyContent: "center",alignItems: "center"},
  section: { marginBottom: 14 },
  sectionTitle: {color: "#fff",fontSize: 15,fontWeight: "600",marginBottom: 8}
});
