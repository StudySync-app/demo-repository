import React from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const items = [
  { title: "Disable all notifications", subtitle: "Master notification switch.", icon: "notifications-off", route: "DisableNotifications" },
  { title: "Notifications categories", subtitle: "Choose which reminders to receive.", icon: "checklist", route: "NotificationCategories" },
  { title: "Sound & vibration", subtitle: "Control reminder alert behavior.", icon: "volume-up", route: "SoundVibration" },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();

  return (
    <ImageBackground source={require("../../../assets/dashboard_bg.png")} style={{ flex: 1 }} resizeMode="cover">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.subHeader}>Notifications</Text>
        </View>

        {items.map((item) => (
          <TouchableOpacity key={item.route} style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate(item.route)}>
            <View>
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
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginBottom: 3 },
  cardSubtitle: { color: "#FFFFFF", fontSize: 12, lineHeight: 16 },
});
