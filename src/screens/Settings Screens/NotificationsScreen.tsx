import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


export default function NotificationsScreen() {
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

        <Text style={styles.subHeader}>Notifications</Text>
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

  settingCard: {
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
