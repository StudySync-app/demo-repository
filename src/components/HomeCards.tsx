import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// These types match your original code
export type SectionVariant = "files" | "tagged" | "folders";
export type CardKind = "todos" | "media" | "notes";

interface HomeCardsProps {
  variant: SectionVariant;
  counts: { todos: number; media: number; notes: number };
  subtitleFor: (kind: CardKind) => string | undefined;
  onCardPress?: (kind: CardKind) => void;
  // Dimensions passed from parent to keep layout consistent
  fittedCardWidth: number;
  fittedCardHeight: number;
  needsHorizontalCardScroll: boolean;
  spacing: number;
}

const PRIMARY_ICON: Record<CardKind, string> = {
  todos: "assignment",
  media: "perm-media",
  notes: "sticky-note-2"
};

const CARD_W_BASE = 124;
const CARD_GAP = 12;

function badgeIconName(variant: SectionVariant): string {
  switch (variant) {
    case "files": return "insert-drive-file";
    case "tagged": return "bookmark";
    case "folders": return "folder";
    default: return "insert-drive-file";
  }
}

export const HomeCards: React.FC<HomeCardsProps> = ({
  variant,
  counts,
  subtitleFor,
  onCardPress,
  fittedCardWidth,
  fittedCardHeight,
  needsHorizontalCardScroll,
  spacing
}) => {
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

  // Scaling logic moved from your original renderCardRow
  const iconScale = Math.min(1, fittedCardWidth / CARD_W_BASE);
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
    const wrapProps = onCardPress ? {
      activeOpacity: 0.88,
      onPress: () => onCardPress(kind),
    } : {};

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
          <View style={[styles.primaryIconWrap, {
            width: iconWrap,
            height: iconWrap,
            borderRadius: Math.round(12 * iconScale)
          }]}>
            <MaterialIcons name={PRIMARY_ICON[kind]} size={primaryIconSize} color="#FFFFFF" />
          </View>
          <MaterialIcons name={badgeIconName(variant)} size={badgeIconSize} color="#FFFFFF" />
        </View>
        
        <Text style={[styles.cardTitle, { fontSize: titleFont, lineHeight: titleFont + 2 }]} numberOfLines={2}>
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
        style={[styles.cardRowScroll, { marginHorizontal: -spacing }]}
        contentContainerStyle={[styles.cardRowScrollContent, { paddingHorizontal: spacing }]}
        decelerationRate="fast"
      >
        {cards}
      </ScrollView>
    );
  }

  return <View style={styles.row}>{cards}</View>;
};

const styles = StyleSheet.create({
  cardRowScroll: { flexGrow: 0 },
  cardRowScrollContent: { flexDirection: "row", alignItems: "stretch", paddingBottom: 4 },
  row: { flexDirection: "row", justifyContent: "flex-start", alignItems: "stretch" },
  card: { backgroundColor: "#1A2535", borderRadius: 20, padding: 8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  primaryIconWrap: { backgroundColor: "#3C61A4", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,140,60,0.35)" },
  cardTitle: { color: "#FFFFFF", fontWeight: "700", marginBottom: 2 },
  cardSubtitle: { color: "#9CA3AF", marginBottom: 4, minHeight: 11 },
  subtitleSpacer: { minHeight: 11, marginBottom: 4 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  cardCount: { color: "#9CA3AF", flex: 1, marginRight: 4 }
});