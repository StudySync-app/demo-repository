import React, { useCallback, useState, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { useTaskStore } from "../../store/useTaskStore"; 
import { deleteTask, toggleTaskCompleted, type Task } from "../../db/tasks";
import { isContentTagged, toggleContentTag } from "../../db/tags";
import { addFolder, getFolders } from "../../db/folders";
import { TaskCard } from "../../components/TaskCard";
import { CreateFolderSheet } from "../../components/CreateFolderSheet";

export default function FileTasksManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const { tasks, loadTasks } = useTaskStore();
  // State to track if we are viewing archived (completed) tasks
  const [showArchived, setShowArchived] = useState(false);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  // Filter tasks based on whether they are completed or not
  const displayedTasks = useMemo(() => {
    return tasks.filter((task: Task) => 
      showArchived ? task.completed : !task.completed
    );
  }, [tasks, showArchived]);

  const groupedTasks = useMemo(() => {
    const groups = [
      { key: "urgent", label: "Urgent", items: [] as Task[] },
      { key: "important", label: "Important", items: [] as Task[] },
      { key: "minor", label: "Minor", items: [] as Task[] },
    ];

    displayedTasks.forEach((task) => {
      const key = task.priority === "urgent" || task.priority === "important" ? task.priority : "minor";
      groups.find((group) => group.key === key)?.items.push(task);
    });

    return groups.filter((group) => group.items.length > 0);
  }, [displayedTasks]);

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case "urgent": return { label: "Urgent", color: "#EF4444" };
      case "important": return { label: "Important", color: "#EAB308" };
      default: return { label: "Minor", color: "#22C55E" };
    }
  };

  // The Restore Function
const handleRestore = async (taskId: number) => {
  // This updates the database to set completed to false (0)
  await toggleTaskCompleted(taskId, false); 
  // Refresh the list so it moves back to the "To do" list
  loadTasks(); 
};

  const handleDelete = (task: Task) => {
    Alert.alert("Delete Task", `Remove "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          await deleteTask(task.id);
          loadTasks();
        } 
      },
    ]);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await addFolder(name.trim(), "Tasks");
      setFolderSheetVisible(false);
      navigation.navigate("FolderedTaskManager");
    } catch {
      Alert.alert("Folder error", "Could not create the folder.");
    }
  };

  return (
    <View style={styles.container}>
      <CreateFolderSheet
        isVisible={folderSheetVisible}
        onClose={() => setFolderSheetVisible(false)}
        onCreate={handleCreateFolder}
        folders={getFolders()}
      />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {showArchived ? "Archived Tasks" : "My to do's"}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          {/* Archive Toggle Button */}
          <TouchableOpacity 
            style={[styles.actionBtn, showArchived && styles.activeActionBtn]} 
            onPress={() => setShowArchived(!showArchived)}
          >
            <MaterialIcons 
              name={showArchived ? "assignment" : "archive"} 
              size={24} 
              color="#FFF" 
            />
          </TouchableOpacity>

          {/* Add Task Button (Optional: Keep or hide when in archive) */}
          {!showArchived && (
            <>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setFolderSheetVisible(true)}
              >
                <MaterialIcons name="create-new-folder" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate("TasksScreen")}
              >
                <MaterialIcons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100 // Extra padding to clear your bottom nav bar
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {displayedTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons 
                name={showArchived ? "archive" : "assignment-turned-in"} 
                size={48} 
                color="#1F2A43" 
              />
              <Text style={styles.emptyText}>
                {showArchived ? "No completed tasks yet." : "All caught up!"}
              </Text>
            </View>
          ) : (
            groupedTasks.map((group) => (
              <View key={group.key}>
                {!showArchived && <Text style={styles.groupTitle}>{group.label}</Text>}
                {group.items.map((task: Task) => {
                  const priorityInfo = getPriorityInfo(task.priority || "");
                  return (
                    <TaskCard 
                      key={task.id}
                      title={task.title}
                      subtitle={task.description || "No description"}
                      dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                      priority={showArchived ? "Completed" : priorityInfo.label}
                      priorityColor={showArchived ? "#22C55E" : priorityInfo.color}
                      progress={task.status || "todo"}
                      isCompleted={!!task.completed}
                      onToggleCheck={showArchived ? undefined : async () => {
                        await toggleTaskCompleted(task.id, !task.completed);
                        loadTasks();
                      }}
                      onEdit={task.completed ? () => handleRestore(task.id) : () => navigation.navigate("TasksScreen", { task })}                  
                      onDelete={() => handleDelete(task)}
                      onTagPress={() => {
                        toggleContentTag("task", task.id);
                        loadTasks();
                      }}
                      tagged={isContentTagged("task", task.id)}
                    />
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: 24, fontWeight: "700", marginLeft: 15 },
  headerActions: { flexDirection: "row", gap: 10 },
  actionBtn: { backgroundColor: "#1F2A43", padding: 8, borderRadius: 8 },
  activeActionBtn: { backgroundColor: "#4B76E7" }, // Highlight when viewing archive
  content: { padding: 20 },
  groupTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", marginBottom: 10, marginTop: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 12, fontSize: 16 }
});
