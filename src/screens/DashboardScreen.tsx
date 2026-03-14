import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

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

  useEffect(() => {
    const data = getTaskStats();
    setStats(data);

    setTodayTasks(getTodaysTasks());
    setOverdueTasks(getOverdueTasks());
    setUpcomingTasks(getUpcomingTasks());
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.statLabel}>Total Tasks</Text>
        <Text style={styles.statValue}>{stats.total}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statLabel}>Completed Tasks</Text>
        <Text style={styles.statValue}>{stats.completed}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statLabel}>Pending Tasks</Text>
        <Text style={styles.statValue}>{stats.pending}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statLabel}>Completion Rate</Text>
        <Text style={styles.statValue}>{stats.completionRate}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statLabel}>Today's Tasks</Text>
        <Text style={styles.statValue}>{todayTasks.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statLabel}>Overdue Tasks</Text>
        <Text style={styles.statValue}>{overdueTasks.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statLabel}>Upcoming Tasks</Text>
        <Text style={styles.statValue}>{upcomingTasks.length}</Text>
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.text
  },

  card: {
    padding: SPACING.card,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    elevation: 2
  },

  statLabel: {
    fontSize: 14,
    color: COLORS.subtext
  },

  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
    color: COLORS.text
  }

});