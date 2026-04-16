import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { addNote, getNotes, deleteNote } from "../db/notes";
import { summarizeText } from "../lib/ai";

export default function NotesScreen() {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState("");

  const loadNotes = () => {
    const data = getNotes();
    setNotes(data);
  };

  const handleAddNote = () => {
    if (!title.trim() || !content.trim()) return;

    addNote(title, content);

    setTitle("");
    setContent("");

    loadNotes();
  };

  const summarizeNote = async (text: string) => {
    const result = await summarizeText(text);
    setSummary(result || "");
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Notes</Text>

      {/* CREATE NOTE */}
      <View style={styles.card}>
        <TextInput
          placeholder="Note title"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Write your note"
          placeholderTextColor="#94A3B8"
          value={content}
          onChangeText={setContent}
          style={[styles.input, { height: 80 }]}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleAddNote}>
          <Text style={styles.buttonText}>Add Note</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="Search notes..."
        placeholderTextColor="#94A3B8"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* NOTES LIST */}
      {filteredNotes.map((note) => (

        <View key={note.id} style={styles.noteCard}>

          <Text style={styles.noteTitle}>{note.title}</Text>

          <Text style={styles.noteContent}>
            {note.content}
          </Text>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => summarizeNote(note.content)}
          >
            <Text style={styles.secondaryText}>Summarize</Text>
          </TouchableOpacity>

          {summary ? (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>AI Summary</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => {
              deleteNote(note.id);
              loadNotes();
            }}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>

        </View>

      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0F172A" // 🔥 SAME AS TASKS
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10
  },

  card: {
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16
  },

  input: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155"
  },

  button: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },

  search: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155"
  },

  noteCard: {
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12
  },

  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff"
  },

  noteContent: {
    color: "#94A3B8",
    marginVertical: 8
  },

  secondaryBtn: {
    backgroundColor: "#334155",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    alignItems: "center"
  },

  secondaryText: {
    color: "#fff"
  },

  deleteBtn: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center"
  },

  deleteText: {
    color: "#fff",
    fontWeight: "600"
  },

  summaryBox: {
    backgroundColor: "#020617",
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },

  summaryTitle: {
    color: "#38BDF8",
    fontWeight: "600"
  },

  summaryText: {
    color: "#E2E8F0"
  }

});