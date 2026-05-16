import React from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppSettings } from "../../settings/AppSettingsContext";

const items = [
  { title: "Dark or light mode", subtitle: "Choose the app appearance.", icon: "dark-mode", route: "ThemeMode" },
  { title: "Font size & style", subtitle: "Adjust reading comfort.", icon: "format-size", route: "FontSize" },
];

export default function PersonalizationScreen() {
  const navigation = useNavigation<any>();
  const { isLight, textScale } = useAppSettings();

  const content = (
      <ScrollView style={[styles.container, isLight && styles.lightContainer]} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={22} color={isLight ? "#0F172A" : "#FFFFFF"} />
          </TouchableOpacity>
          <Text style={[styles.subHeader, isLight && styles.lightTitle, { fontSize: 22 * textScale }]}>Personalization</Text>
        </View>

        {items.map((item) => (
          <TouchableOpacity key={item.route} style={[styles.card, isLight && styles.lightCard]} activeOpacity={0.85} onPress={() => navigation.navigate(item.route)}>
            <View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, isLight && styles.lightTitle, { fontSize: 18 * textScale }]}>{item.title}</Text>
              <Text style={[styles.cardSubtitle, isLight && styles.lightSubtitle, { fontSize: 12 * textScale }]}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
  );

  if (isLight) {
    return <View style={styles.lightRoot}>{content}</View>;
  }

  return (
    <ImageBackground source={require("../../../assets/dashboard_bg.png")} style={{ flex: 1 }} resizeMode="cover">
      {content}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  lightRoot: { flex: 1, backgroundColor: "#F4F7FB" },
  lightContainer: { backgroundColor: "#F4F7FB" },
  content: { padding: 20, paddingTop: 55, paddingBottom: 110 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 14 },
  subHeader: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1A2535", borderRadius: 14, padding: 14, marginBottom: 10 },
  lightCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE4F0" },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginBottom: 3 },
  cardSubtitle: { color: "#FFFFFF", fontSize: 12, lineHeight: 16 },
  lightTitle: { color: "#0F172A" },
  lightSubtitle: { color: "#64748B" },
});
