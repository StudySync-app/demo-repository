import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface NoteCardProps {
  title: string;
  date: string | Date; // Can accept a string from DB or a Date object
  onPress?: () => void;
  onDelete?: () => void;
  onTagPress?: () => void;
  onFolderPress?: () => void;
  tagged?: boolean;
}

export default function NoteCard({ title, date, onPress, onDelete, onTagPress, onFolderPress, tagged = false }: NoteCardProps) {
  
  // Function to format date to: "November 25 Tue 12:00 AM"
  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    
    // Check if date is valid to avoid "Invalid Date" showing on UI
    if (isNaN(d.getTime())) return "Date unknown";

    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };

    // Formats to: "Tuesday, November 25, 12:00 AM"
    const formatted = new Intl.DateTimeFormat('en-US', options).format(d);
    
    // Custom cleanup to match your screenshot: "November 25 Tue 12:00 AM"
    // (Removes commas and rearranges slightly)
    const parts = formatted.replace(/,/g, '').split(' ');
    const [weekday, month, day, time, ampm] = parts;
    
    return `${month} ${day} ${weekday} ${time} ${ampm}`;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title || "Note Title"}
        </Text>
        <Text style={styles.date}>
          {formatDate(date)}
        </Text>
      </View>

      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={onTagPress} hitSlop={10} style={styles.deleteButton}>
          <Ionicons name="bookmark" size={20} color={tagged ? "#60A5FA" : "#ffffff"} />
        </TouchableOpacity>
        {onFolderPress ? (
          <TouchableOpacity onPress={onFolderPress} hitSlop={10} style={styles.deleteButton}>
            <Ionicons name="folder-open-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : null}
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} hitSlop={10} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#F87171" />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#162133",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: {
    color: "#4d79ff",
    fontSize: 12,
    fontWeight: "500",
  },
  iconContainer: {
    paddingLeft: 10,
    paddingBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: { padding: 2 },
});
