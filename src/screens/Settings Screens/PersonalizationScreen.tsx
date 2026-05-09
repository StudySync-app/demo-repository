import React from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const items = [
  { title: "Dark or light mode", subtitle: "Choose the app appearance.", icon: "dark-mode", route: "ThemeMode" },
  { title: "Language", subtitle: "Select your preferred language.", icon: "language", route: "Language" },
  { title: "Font size & style", subtitle: "Adjust reading comfort.", icon: "format-size", route: "FontSize" },
];

export default function PersonalizationScreen() {
  const navigation = useNavigation<any>();

  return (
    <ImageBackground source={require("../../../assets/dashboard_bg.png")} style={{ flex: 1 }} resizeMode="cover">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.subHeader}>Personalization</Text>
        </View>

        {items.map((item) => (
          <TouchableOpacity key={item.route} style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate(item.route)}>
            <View style={styles.iconCircle}>
              <MaterialIcons name={item.icon as any} size={20} color="#58A6FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 20, paddingTop: 55, paddingBottom: 110 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 14 },
  subHeader: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1A2535", borderRadius: 14, padding: 14, marginBottom: 10 },
  iconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#10223A", alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", marginBottom: 3 },
  cardSubtitle: { color: "#A3AED0", fontSize: 11, lineHeight: 16 },
});
