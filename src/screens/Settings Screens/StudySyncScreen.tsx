import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function StudySyncScreen() {
const navigation = useNavigation<any>();

  return (
  <ImageBackground
    source={require("../../../assets/dashboard_bg.png")}
    style={{ flex: 1 }}
    resizeMode="cover"
  >
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.subHeader}>StudySync AI</Text>
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
  </ImageBackground>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent"
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 14
  },

  subHeader: {
  color: "#FFFFFF",
  fontSize: 22,
  fontWeight: "600"
  },

  card: {
    backgroundColor: "#1A2535",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
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
