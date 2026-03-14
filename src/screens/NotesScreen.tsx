import React, { useState, useCallback } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { addNote, getNotes, deleteNote } from "../db/notes";
import { summarizeText } from "../lib/ai";

import { COLORS, SPACING, RADIUS } from "../constants/theme";

export default function NotesScreen() {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

  const [summary, setSummary] = useState<{ [key: number]: string }>({});

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

  const summarizeNote = async (noteId: number, text: string) => {
    const result = await summarizeText(text);

    setSummary((prev) => ({
      ...prev,
      [noteId]: result || ""
    }));
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Notes</Text>

      {/* Create Note */}
      <View style={styles.card}>

        <TextInput
          placeholder="Note title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Write your note"
          value={content}
          onChangeText={setContent}
          style={[styles.input, { height: 80 }]}
          multiline
        />

        <Button title="Add Note" onPress={handleAddNote} />

      </View>

      {/* Notes List */}
      {notes.map((note) => (

        <View key={note.id} style={styles.noteCard}>

          <Text style={styles.noteTitle}>
            {note.title}
          </Text>

          <Text style={styles.noteContent}>
            {note.content}
          </Text>

          <Button
            title="Summarize"
            onPress={() => summarizeNote(note.id, note.content)}
          />

          {summary[note.id] ? (
            <View style={styles.summaryBox}>

              <Text style={styles.summaryTitle}>
                AI Summary
              </Text>

              <Text style={styles.summaryText}>
                {summary[note.id]}
              </Text>

            </View>
          ) : null}

          <Button
            title="Delete"
            onPress={() => {
              deleteNote(note.id);
              loadNotes();
            }}
          />

        </View>

      ))}

    </ScrollView>
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
    marginBottom: 20,
    elevation: 2
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8
  },

  noteCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.card,
    borderRadius: RADIUS.card,
    marginBottom: 12,
    elevation: 2
  },

  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.text
  },

  noteContent: {
    color: COLORS.subtext,
    marginBottom: 10
  },

  summaryBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#eef6ff",
    borderRadius: 8
  },

  summaryTitle: {
    fontWeight: "bold",
    marginBottom: 4
  },

  summaryText: {
    color: "#333"
  }

});