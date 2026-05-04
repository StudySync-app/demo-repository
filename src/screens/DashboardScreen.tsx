import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getTasks, Task } from "../db/tasks";
import { getNotes, Note } from "../db/notes";
import { getMedia, MediaItem } from "../db/media";
import {
  getTaggedCountsByContentType,
  getTaggedContentIds
} from "../db/tags";

import { SPACING } from "../constants/theme";

type SectionVariant = "files" | "tagged" | "folders";

type CardKind = "todos" | "media" | "notes";

const CARD_W = 124;
const CARD_H = 111;
const CARD_GAP = 12;

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

function latestCreatedAt(
  items: { createdAt?: string | null }[]
): string | null {
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
  return best;
}

const PRIMARY_ICON: Record<
  CardKind,
  "assignment" | "perm-media" | "sticky-note-2"
> = {
  todos: "assignment",
  media: "perm-media",
  notes: "sticky-note-2"
};

function badgeIconName(
  variant: SectionVariant
): "insert-drive-file" | "bookmark" | "folder" {
  switch (variant) {
    case "files":
      return "insert-drive-file";
    case "tagged":
      return "bookmark";
    case "folders":
      return "folder";
    default:
      return "insert-drive-file";
  }
}

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [tagged, setTagged] = useState({
    tasks: 0,
    notes: 0,
    media: 0
  });

  const refresh = useCallback(() => {
    setTasks(getTasks());
    setNotes(getNotes());
    setMedia(getMedia());
    setTagged(getTaggedCountsByContentType());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const tasksInFolders = tasks.filter((t) => t.folderId != null);
  const notesInFolders = notes.filter((n) => n.folderId != null);
  const mediaInFolders = media.filter((m) => m.folderId != null);

  const taggedTaskIds = useMemo(
    () => new Set(getTaggedContentIds("task")),
    [tagged.tasks]
  );
  const taggedNoteIds = useMemo(
    () => new Set(getTaggedContentIds("note")),
    [tagged.notes]
  );
  const taggedMediaIds = useMemo(
    () => new Set(getTaggedContentIds("media")),
    [tagged.media]
  );

  /** Inner width under horizontal padding — used to decide fit vs horizontal scroll. */
  const rowInnerWidth = windowWidth - SPACING.screen * 2;
  const needsHorizontalCardScroll =
    rowInnerWidth < CARD_W * 3 + CARD_GAP * 2 - 0.5;

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

  const renderCardRow = (
    variant: SectionVariant,
    counts: { todos: number; media: number; notes: number },
    subtitleFor: (kind: CardKind) => string | undefined,
    onCardPress?: (kind: CardKind) => void
  ) => {
    const kinds: CardKind[] = ["todos", "media", "notes"];
    const titles: Record<CardKind, string> = {
      todos: "My to dos",
      media: "My media",
      notes: "My notes"
    };
    const countMap: Record<CardKind, number> = {
      todos: counts.todos,
      media: counts.media,
      notes: counts.notes
    };

    const iconScale = Math.min(1, fittedCardWidth / CARD_W);
    const primaryIconSize = Math.max(16, Math.round(20 * iconScale));
    const badgeIconSize = Math.max(14, Math.round(18 * iconScale));
    const moreIconSize = Math.max(14, Math.round(18 * iconScale));
    const titleFont = Math.max(10, Math.round(11 * iconScale));
    const subFont = Math.max(8, Math.round(9 * iconScale));
    const countFont = Math.max(8, Math.round(10 * iconScale));
    const iconWrap = Math.max(26, Math.round(32 * iconScale));

    const cards = kinds.map((kind, index) => {
      const count = countMap[kind];
      const sub = subtitleFor(kind);
      const Wrapper = onCardPress ? TouchableOpacity : View;
      const wrapProps =
        onCardPress != null
          ? {
              activeOpacity: 0.88 as const,
              onPress: () => onCardPress(kind),
              accessibilityRole: "button" as const
            }
          : {};

      return (
        <Wrapper
          key={kind}
          {...wrapProps}
          style={[
            styles.card,
            {
              width: fittedCardWidth,
              height: fittedCardHeight,
              marginRight: index < kinds.length - 1 ? CARD_GAP : 0
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.primaryIconWrap,
                {
                  width: iconWrap,
                  height: iconWrap,
                  borderRadius: Math.round(12 * iconScale)
                }
              ]}
            >
              <MaterialIcons
                name={PRIMARY_ICON[kind]}
                size={primaryIconSize}
                color="#FFFFFF"
              />
            </View>
            <MaterialIcons
              name={badgeIconName(variant)}
              size={badgeIconSize}
              color="#FFFFFF"
            />
          </View>
          <Text
            style={[styles.cardTitle, { fontSize: titleFont, lineHeight: titleFont + 2 }]}
            numberOfLines={2}
          >
            {titles[kind]}
          </Text>
          {sub ? (
            <Text style={[styles.cardSubtitle, { fontSize: subFont }]}>{sub}</Text>
          ) : (
            <View style={styles.subtitleSpacer} />
          )}
          <View style={styles.cardFooter}>
            <Text style={[styles.cardCount, { fontSize: countFont }]}>{count} item(s)</Text>
            <TouchableOpacity hitSlop={10}>
              <MaterialIcons name="more-vert" size={moreIconSize} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </Wrapper>
          );
        });

    if (needsHorizontalCardScroll) {
      return (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.cardRowScroll}
          contentContainerStyle={styles.cardRowScrollContent}
          decelerationRate="fast"
        >
          {cards}
        </ScrollView>
      );
    }

    return <View style={styles.row}>{cards}</View>;
  };

  const myFilesCounts = {
    todos: tasks.length,
    media: media.length,
    notes: notes.length
  };

  const taggedCounts = {
    todos: tagged.tasks,
    media: tagged.media,
    notes: tagged.notes
  };

  const folderCounts = {
    todos: tasksInFolders.length,
    media: mediaInFolders.length,
    notes: notesInFolders.length
  };

  const subtitleMyFiles = (kind: CardKind) => {
    const list =
      kind === "todos"
        ? tasks
        : kind === "media"
          ? media
          : notes;
    const iso = latestCreatedAt(list);
    if (list.length === 0) return undefined;
    return formatRelativeTime(iso);
  };

  const subtitleTagged = (kind: CardKind) => {
    const n =
      kind === "todos"
        ? taggedCounts.todos
        : kind === "media"
          ? taggedCounts.media
          : taggedCounts.notes;
    if (n === 0) return undefined;
    const list =
      kind === "todos"
        ? tasks.filter((t) => taggedTaskIds.has(t.id))
        : kind === "media"
          ? media.filter((m) => taggedMediaIds.has(m.id))
          : notes.filter((note) => taggedNoteIds.has(note.id));
    const iso = latestCreatedAt(list);
    return formatRelativeTime(iso);
  };

  const subtitleFolders = (kind: CardKind) => {
    const list =
      kind === "todos"
        ? tasksInFolders
        : kind === "media"
          ? mediaInFolders
          : notesInFolders;
    if (list.length === 0) return undefined;
    const iso = latestCreatedAt(list);
    return formatRelativeTime(iso);
  };

  const contentPaddingTop = insets.top + 8;
  const contentPaddingBottom = insets.bottom + 32;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: contentPaddingTop,
          paddingBottom: contentPaddingBottom
        }
      ]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={Platform.OS === "android"}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <View style={[styles.brandRow, styles.brandRowShrink]}>
          <Image
            source={require("../../assets/studysync_logo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
            accessibilityLabel="StudySync"
          />
          <View style={styles.brandIcon}>
            <Text style={styles.brandLetter} numberOfLines={1} ellipsizeMode="tail">
              StudySync
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.searchBtn} hitSlop={12}>
          <MaterialIcons name="search" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My files</Text>
        {renderCardRow("files", myFilesCounts, subtitleMyFiles, (kind) => {
          if (kind === "todos") {
            navigation.navigate("To dos");
          }
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tagged files</Text>
        {renderCardRow("tagged", taggedCounts, subtitleTagged)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My folders</Text>
        {renderCardRow("folders", folderCounts, subtitleFolders)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816"
  },

  contentContainer: {
    paddingHorizontal: SPACING.screen
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    minHeight: 44
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0
  },

  brandRowShrink: {
    flex: 1,
    marginRight: 12,
    justifyContent: "flex-start"
  },

  brandIcon: {
    justifyContent: "center",
    minWidth: 0,
    flexShrink: 1
  },

  brandLetter: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700"
  },

  brandLogo: {
    height: 44,
    width: 44,
    flexShrink: 0,
    marginRight: 10
  },

  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1F2A43",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0
  },

  section: {
    marginBottom: 22
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12
  },

  cardRowScroll: {
    marginHorizontal: -SPACING.screen,
    flexGrow: 0
  },

  cardRowScrollContent: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: SPACING.screen,
    paddingBottom: 4
  },

  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "stretch",
    flexWrap: "nowrap"
  },

  card: {
    backgroundColor: "#1A2535",
    borderRadius: 20,
    padding: 8
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },

  primaryIconWrap: {
    borderRadius: 12,
    backgroundColor: "#3C61A4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,140,60,0.35)"
  },

  cardTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 2
  },

  cardSubtitle: {
    color: "#9CA3AF",
    marginBottom: 4,
    minHeight: 11
  },

  subtitleSpacer: {
    minHeight: 11,
    marginBottom: 4
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto"
  },

  cardCount: {
    color: "#9CA3AF",
    flex: 1,
    marginRight: 4
  }
});
