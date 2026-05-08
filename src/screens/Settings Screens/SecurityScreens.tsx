import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function SecurityScreens() {
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

        <Text style={styles.subHeader}>Security</Text>
      </View>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Two-factor authentication</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>Manage your password, Two-Factor Authentication, and active devices.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Text style={styles.cardTitle}>Change password</Text>
        <Text style={styles.cardSubtitle}>Manage your password, Two-Factor Authentication, and active devices.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Text style={styles.cardTitle}>Recovery phone</Text>
        <Text style={styles.cardSubtitle}>Control how and when you receive alerts from the app.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Text style={styles.cardTitle}>Recovery email</Text>
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

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 12
  },

  statusBadge: {
    backgroundColor: "#1F2A43",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6
  },

  statusText: {
    color: "#4AFD84",
    fontSize: 12,
    fontWeight: "700"
  },

  cardSubtitle: {
    color: "#A3AED0",
    fontSize: 14,
    lineHeight: 20
  }
});
