import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface TaskCardProps {
  title: string;
  subtitle: string;
  dueDate: string;
  priority: string;
  priorityColor?: string;
  progress: string;
  progressColor?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleCheck?: () => void;
  onTagPress?: () => void;
  tagged?: boolean;
  isCompleted?: boolean;
}

export const TaskCard = ({
  title,
  subtitle,
  dueDate,
  priority,
  priorityColor = '#EAB308',
  progress,
  progressColor = '#22C55E',
  onEdit,
  onDelete,
  onToggleCheck,
  onTagPress,
  tagged = false,
  isCompleted = false
}: TaskCardProps) => {
  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <TouchableOpacity onPress={onToggleCheck}>
            <MaterialIcons 
              name={isCompleted ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color={isCompleted ? "#22C55E" : "#FFF"} 
              style={styles.checkIcon} 
            />
          </TouchableOpacity>
          <View>
            <Text style={[styles.taskTitle, isCompleted && styles.completedText]}>{title}</Text>
            <Text style={styles.taskSub}>{subtitle}</Text>
          </View>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={onEdit}>
            <MaterialIcons 
              name={isCompleted ? "settings-backup-restore" : "edit"} 
              size={22} 
              color="#FFF" 
              style={styles.iconSpacing} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete}>
            <MaterialIcons name="delete" size={22} color="#FFF" />
          </TouchableOpacity>
          {onTagPress ? (
            <TouchableOpacity onPress={onTagPress}>
              <MaterialIcons name="bookmark" size={22} color={tagged ? "#60A5FA" : "#FFF"} style={styles.bookmarkIcon} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.metaText}>Due: {dueDate}</Text>
        <Text style={[styles.metaText, { color: isCompleted ? "#D1FAE5" : priorityColor }]}>
          {isCompleted ? "Done" : `Priority: ${priority}`}
        </Text>
        <Text style={[styles.metaText, { color: isCompleted ? "#D1FAE5" : progressColor }]}>
          {isCompleted ? "Done" : `Progress: ${progress}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 16,
  },
  cardCompleted: {
    backgroundColor: "#064E3B", // Card turns green when completed
    borderColor: "#10B981",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: 12,
  },
  taskTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#D1FAE5', // Adjusted for better visibility on green
  },
  taskSub: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSpacing: {
    marginRight: 15,
  },
  bookmarkIcon: {
    marginLeft: 15,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 15,
  },
  metaText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
});
