import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function PersonalizationScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.backButton} />
        <Text style={styles.title}>Personalization</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Customize your StudySync experience</Text>
        <Text style={styles.heroSubtitle}>Choose colors, themes, and display options to match your workflow.</Text>
      </View>

      <View style={styles.settingList}>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.iconPlaceholder} />
          <View style={styles.textBlock}>
            <Text style={styles.settingTitle}>App theme</Text>
            <Text style={styles.settingSubtitle}>Switch between dark and light modes.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.iconPlaceholder} />
          <View style={styles.textBlock}>
            <Text style={styles.settingTitle}>Accent color</Text>
            <Text style={styles.settingSubtitle}>Pick a brand color for buttons and highlights.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.iconPlaceholder} />
          <View style={styles.textBlock}>
            <Text style={styles.settingTitle}>Font size</Text>
            <Text style={styles.settingSubtitle}>Adjust text size for easier reading.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.iconPlaceholder} />
          <View style={styles.textBlock}>
            <Text style={styles.settingTitle}>Background</Text>
            <Text style={styles.settingSubtitle}>Select a wallpaper for the dashboard.</Text>
          </View>
        </TouchableOpacity>
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

  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10
  },

  heroSubtitle: {
    color: "#A3AED0",
    fontSize: 14,
    lineHeight: 20
  },

  settingList: {
    marginTop: 8
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14
  },

  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#1F2A43",
    marginRight: 14
  },

  textBlock: {
    flex: 1
  },

  settingTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  },

  settingSubtitle: {
    color: "#A3AED0",
    fontSize: 13,
    lineHeight: 19
  }
});
