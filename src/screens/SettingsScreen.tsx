import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS, SPACING, RADIUS } from "../constants/theme";

type SettingsStackParamList = {
  SettingsMain: undefined;
  MyAccount: undefined;
  Personalization: undefined;
  Notifications: undefined;
  Security: undefined;
  StudySync: undefined;
};

type SettingsRouteName = keyof Omit<SettingsStackParamList, "SettingsMain">;

const settingsItems: Array<{
  title: string;
  icon: string;
  route: SettingsRouteName;
}> = [
  { title: "My account", icon: "user", route: "MyAccount" },
  { title: "Personalization", icon: "paint", route: "Personalization" },
  { title: "Notifications", icon: "bell", route: "Notifications" },
  { title: "Security", icon: "shield", route: "Security" },
  { title: "StudySync AI", icon: "spark", route: "StudySync" }
];

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList, "SettingsMain">>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.arrowBack} />
        <Text style={styles.title}>Settings</Text>
        <View style={styles.searchIcon} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Tailor your</Text>
          <Text style={styles.heroTitle}>experience here</Text>
          <Text style={styles.heroTitle}>at StudySync</Text>
        </View>
        <View style={styles.heroGraphic} />
      </View>

      <View style={styles.settingsList}>
        {settingsItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.settingItem}
            activeOpacity={0.8}
            onPress={() => navigation.push(item.route)}
          >
            <View style={styles.settingIcon} />
            <Text style={styles.settingText}>{item.title}</Text>
            <View style={styles.chevron} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816"
  },

  content: {
    padding: SPACING.screen,
    paddingBottom: 40
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24
  },

  arrowBack: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#0F172A"
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700"
  },

  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#0F172A"
  },

  heroCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 26,
    padding: 20,
    marginBottom: 24,
    minHeight: 160
  },

  heroText: {
    flex: 1,
    paddingRight: 16
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 4
  },

  heroGraphic: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: "#1E2A38"
  },

  settingsList: {
    marginTop: 8
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14
  },

  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#1F2A43",
    marginRight: 14
  },

  settingText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },

  chevron: {
    width: 20,
    height: 20,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#4B76E7",
    transform: [{ rotate: "45deg" }]
  }
});