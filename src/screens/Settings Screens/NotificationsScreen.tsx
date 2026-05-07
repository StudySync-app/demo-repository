import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function NotificationsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.backButton} />
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.settingCard}>
        <Text style={styles.settingTitle}>Disable all notifications</Text>
        <Text style={styles.settingSubtitle}>Keep your details current and accurate.</Text>
      </View>

      <View style={styles.settingCard}>
        <Text style={styles.settingTitle}>Notifications categories</Text>
        <Text style={styles.settingSubtitle}>Manage your password, Two-Factor Authentication, and active devices.</Text>
      </View>

      <View style={styles.settingCard}>
        <Text style={styles.settingTitle}>Sound & vibration</Text>
        <Text style={styles.settingSubtitle}>Control how and when you receive alerts from the app.</Text>
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
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#111827"
  },

  placeholder: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "transparent"
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700"
  },

  settingCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6
  },

  settingTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8
  },

  settingSubtitle: {
    color: "#A3AED0",
    fontSize: 14,
    lineHeight: 20
  }
});
