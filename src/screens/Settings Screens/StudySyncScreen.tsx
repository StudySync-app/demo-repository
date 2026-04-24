import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function StudySyncScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.backButton} />
        <Text style={styles.title}>StudySync AI</Text>
        <View style={styles.placeholder} />
      </View>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Text style={styles.cardTitle}>Generate quiz questions</Text>
        <Text style={styles.cardSubtitle}>Keep your details current and accurate.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Text style={styles.cardTitle}>Answer any questions</Text>
        <Text style={styles.cardSubtitle}>Manage your password, Two-Factor Authentication, and active devices.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Text style={styles.cardTitle}>AI suggest</Text>
        <Text style={styles.cardSubtitle}>Control how and when you receive alerts from the app.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Text style={styles.cardTitle}>AI assist</Text>
        <Text style={styles.cardSubtitle}>Control how and when you receive alerts from the app.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Text style={styles.cardTitle}>Remind me AI</Text>
        <Text style={styles.cardSubtitle}>Control how and when you receive alerts from the app.</Text>
      </TouchableOpacity>
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

  card: {
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

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8
  },

  cardSubtitle: {
    color: "#A3AED0",
    fontSize: 14,
    lineHeight: 20
  }
});
