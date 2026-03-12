import React, { useState, useCallback } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { addNote, getNotes, deleteNote } from "../db/notes";
import { COLORS, SPACING, RADIUS } from "../constants/theme";

export default function NotesScreen() {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

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

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Notes</Text>

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

      {notes.map((note) => (

        <View key={note.id} style={styles.noteCard}>

          <Text style={styles.noteTitle}>{note.title}</Text>

          <Text style={styles.noteContent}>
            {note.content}
          </Text>

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
    marginBottom: 4
  },

  noteContent: {
    color: COLORS.subtext,
    marginBottom: 10
  }

});