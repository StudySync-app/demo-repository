import React, { useState, useCallback } from "react";
import { View, Text, TextInput, Button, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { addNote, getNotes, deleteNote } from "../db/notes";

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
    <ScrollView>
      <Text>Notes Screen</Text>

      <TextInput
        placeholder="Note title"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
        }}
      />

      <TextInput
        placeholder="Write your note"
        value={content}
        onChangeText={setContent}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <Button title="Add Note" onPress={handleAddNote} />

      {notes.map((note) => (
        <View
          key={note.id}
          style={{
            borderWidth: 1,
            padding: 10,
            marginTop: 10,
          }}
        >
          <Text>{note.title}</Text>
          <Text>{note.content}</Text>

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