import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { COLORS, SPACING, RADIUS } from "../constants/theme";

export default function SettingsScreen() {

  const [notifications, setNotifications] = React.useState(true);
  const [cloudSync, setCloudSync] = React.useState(true);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>

        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cloud Sync</Text>
          <Switch
            value={cloudSync}
            onValueChange={setCloudSync}
          />
        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: SPACING.screen,
    backgroundColor: COLORS.background
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.text
  },

  card: {
    backgroundColor: COLORS.card,
    padding: SPACING.card,
    borderRadius: RADIUS.card,
    elevation: 2
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  label: {
    fontSize: 16,
    color: COLORS.text
  }

});