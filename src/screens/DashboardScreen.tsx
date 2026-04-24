import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import useNetwork from "../hooks/useNetwork";

import {
  getTaskStats,
  getTodaysTasks,
  getOverdueTasks,
  getUpcomingTasks
} from "../db/tasks";

import { COLORS, SPACING, RADIUS } from "../constants/theme";

export default function DashboardScreen() {

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0
  });

  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const isOnline = useNetwork();

  useEffect(() => {
    const data = getTaskStats();
    setStats(data);

    setTodayTasks(getTodaysTasks());
    setOverdueTasks(getOverdueTasks());
    setUpcomingTasks(getUpcomingTasks());
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.topRow}>
        <View style={styles.statusBar} />
      </View>

      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon} />
          <Text style={styles.brandTitle}>StudySync</Text>
        </View>
        <View style={styles.actionIcon} />
      </View>

      <View style={styles.syncBox}>
        <Text style={styles.syncText}>{isOnline ? "Cloud Sync: Online" : "Cloud Sync: Offline"}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My files</Text>
          <View style={styles.sectionIcon} />
        </View>
        <View style={styles.row}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.smallIcon} />
              <View style={styles.badgeIcon} />
            </View>
            <Text style={styles.cardTitle}>My to dos</Text>
            <Text style={styles.cardSubtitle}>now</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCount}>1 item(s)</Text>
              <View style={styles.footerIcon} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.smallIcon} />
              <View style={styles.smallIconSecondary} />
            </View>
            <Text style={styles.cardTitle}>My media</Text>
            <Text style={styles.cardSubtitle}>10 mins ago</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCount}>0 item(s)</Text>
              <View style={styles.footerIcon} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.smallIcon} />
              <View style={styles.smallIconSecondary} />
            </View>
            <Text style={styles.cardTitle}>My notes</Text>
            <Text style={styles.cardSubtitle}>now</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCount}>1 item(s)</Text>
              <View style={styles.footerIcon} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tagged files</Text>
          <View style={styles.sectionIcon} />
        </View>
        <View style={styles.row}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.smallIcon} />
              <View style={styles.smallIconSecondary} />
            </View>
            <Text style={styles.cardTitle}>My to dos</Text>
            <Text style={styles.cardSubtitle}>2 mins ago</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCount}>0 item(s)</Text>
              <View style={styles.footerIcon} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.smallIcon} />
              <View style={styles.badgeIcon} />
            </View>
            <Text style={styles.cardTitle}>My media</Text>
            <Text style={styles.cardSubtitle}>10 mins ago</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCount}>0 item(s)</Text>
              <View style={styles.footerIcon} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.smallIcon} />
              <View style={styles.smallIconSecondary} />
            </View>
            <Text style={styles.cardTitle}>My notes</Text>
            <Text style={styles.cardSubtitle}>2 days ago</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCount}>0 item(s)</Text>
              <View style={styles.footerIcon} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My folders</Text>
          <View style={styles.sectionIcon} />
        </View>
        <View style={styles.row}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.smallIcon} />
              <View style={styles.smallIconSecondary} />
            </View>
            <Text style={styles.cardTitle}>My to dos</Text>
            <Text style={styles.cardSubtitle}>2 mins ago</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCount}>0 item(s)</Text>
              <View style={styles.footerIcon} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.smallIcon} />
              <View style={styles.badgeIcon} />
            </View>
            <Text style={styles.cardTitle}>My media</Text>
            <Text style={styles.cardSubtitle}>10 mins ago</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCount}>0 item(s)</Text>
              <View style={styles.footerIcon} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.smallIcon} />
              <View style={styles.smallIconSecondary} />
            </View>
            <Text style={styles.cardTitle}>My notes</Text>
            <Text style={styles.cardSubtitle}>2 days ago</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCount}>0 item(s)</Text>
              <View style={styles.footerIcon} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#050816"
  },

  contentContainer: {
    padding: SPACING.screen,
    paddingBottom: 40
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },

  timeText: {
    color: "#FFFFFF",
    fontSize: 14
  },

  statusBar: {
    width: 70,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1F2A43"
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#3C61A4",
    marginRight: 12
  },

  brandTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold"
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1F2A43"
  },

  syncBox: {
    backgroundColor: "#1F2A43",
    padding: 14,
    borderRadius: 20,
    marginBottom: 24
  },

  syncText: {
    color: "#FFFFFF",
    fontWeight: "600"
  },

  section: {
    marginBottom: 24
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },

  sectionIcon: {
    width: 12,
    height: 17,
    borderRadius: 4,
    backgroundColor: "#1F2A43"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  card: {
    flex: 1,
    backgroundColor: "#1A2535",
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    minHeight: 150
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },

  smallIcon: {
    width: 36,
    height: 32,
    borderRadius: 14,
    backgroundColor: "#3C61A4"
  },

  smallIconSecondary: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1F2A43"
  },

  badgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4B76E7"
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6
  },

  cardSubtitle: {
    color: "#BDBDBD",
    fontSize: 12,
    marginBottom: 16
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  cardCount: {
    color: "#BDBDBD",
    fontSize: 10
  },

  footerIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4B76E7"
  }
});