import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FormattingToolbarSheet from "../components/FormattingToolbarSheet";

export default function NoteScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // Input States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // Formatting States
  const [fontSize, setFontSize] = useState(17);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [highlightColor, setHighlightColor] = useState("transparent");
  const [listType, setListType] = useState<"none" | "bullet" | "number">("none");

  const [showFormatting, setShowFormatting] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  // History Logic
  const [history, setHistory] = useState([{ title: "", content: "" }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isInternalChange = useRef(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: "long", day: "numeric", weekday: "short",
      hour: "numeric", minute: "2-digit", hour12: true
    };
    setCurrentDate(now.toLocaleString("en-US", options).replace(/,/g, ""));
  }, []);

  // Handle Immediate List Activation or Selection Wrapping
  const handleListToggle = (type: "none" | "bullet" | "number") => {
    if (type === "none" || type === listType) {
      setListType("none");
      return;
    }

    const prefix = type === "bullet" ? "• " : "1. ";

    // If text is selected, wrap each line
    if (selection.start !== selection.end) {
      const selectedText = content.substring(selection.start, selection.end);
      const lines = selectedText.split("\n");
      const formatted = lines
        .map((line, i) => (type === "bullet" ? `• ${line}` : `${i + 1}. ${line}`))
        .join("\n");

      const newContent = content.substring(0, selection.start) + formatted + content.substring(selection.end);
      setContent(newContent);
    } 
    // If cursor is at start or new line, insert prefix immediately
    else if (content.length === 0 || content.charAt(selection.start - 1) === "\n" || selection.start === 0) {
      const newContent = content.substring(0, selection.start) + prefix + content.substring(selection.start);
      setContent(newContent);
    }

    setListType(type);
  };

  const handleContentChange = (text: string) => {
    let newText = text;
    // Auto-continue lists on Enter
    if (text.length > content.length && text.endsWith("\n")) {
      if (listType === "bullet") {
        newText = text + "• ";
      } else if (listType === "number") {
        const lineCount = text.split("\n").length - 1;
        newText = text + `${lineCount}. `;
      }
    }
    setContent(newText);
    updateHistory(title, newText);
  };

  const updateHistory = (t: string, c: string) => {
    if (isInternalChange.current) { isInternalChange.current = false; return; }
    const nextHistory = history.slice(0, currentIndex + 1);
    const newState = { title: t, content: c };
    if (JSON.stringify(nextHistory[nextHistory.length - 1]) !== JSON.stringify(newState)) {
      setHistory([...nextHistory, newState]);
      setCurrentIndex(nextHistory.length);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      isInternalChange.current = true;
      const prev = history[currentIndex - 1];
      setTitle(prev.title); setContent(prev.content);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      isInternalChange.current = true;
      const nextState = history[currentIndex + 1];
      setTitle(nextState.title);
      setContent(nextState.content);
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Handler for when recording finishes
const handleFinishedRecording = (uri: string | null) => {
  setIsRecording(false);
  if (uri) {
    console.log("Recording saved at:", uri);
    // You can add logic here to save the URI to your note's database
  }
};

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <View style={styles.pillToolbar}>
          <TouchableOpacity onPress={() => setShowFormatting(true)}><Ionicons name="text-outline" size={20} color="#fff" /></TouchableOpacity>
          <TouchableOpacity onPress={() => setIsRecording(!isRecording)}><Ionicons name={isRecording ? "mic" : "mic-outline"} size={20} color={isRecording ? "#ef4444" : "#fff"} /></TouchableOpacity>
          <TouchableOpacity><Ionicons name="shapes-outline" size={20} color="#fff" /></TouchableOpacity>
          <TouchableOpacity><Ionicons name="folder-open-outline" size={20} color="#fff" /></TouchableOpacity>
        </View>
        <View style={styles.rightActions}>
          <TouchableOpacity onPress={handleUndo} disabled={currentIndex === 0}><Ionicons name="arrow-undo-outline" size={22} color={currentIndex === 0 ? "#3f3f46" : "#fff"} /></TouchableOpacity>
          <TouchableOpacity onPress={handleRedo} disabled={currentIndex === history.length - 1}><Ionicons  name="arrow-redo-outline"  size={22} color={currentIndex === history.length - 1 ? "#3f3f46" : "#fff"} /></TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert("Saved", "Note updated.")}><Ionicons name="checkmark" size={26} color="#fff" /></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          placeholderTextColor="#52525b"
          value={title}
          onChangeText={(t) => { setTitle(t); updateHistory(t, content); }}
          multiline
        />
        <View style={styles.metadataRow}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.wordCount}>{content.trim() ? content.trim().split(/\s+/).length : 0} words</Text>
        </View>
        <TextInput
          style={[styles.noteInput, { 
            fontSize, 
            backgroundColor: highlightColor,
            fontWeight: isBold ? "bold" : "normal",
            fontStyle: isItalic ? "italic" : "normal",
            textDecorationLine: isUnderline && isStrike ? "underline line-through" : isUnderline ? "underline" : isStrike ? "line-through" : "none",
            padding: highlightColor !== "transparent" ? 10 : 0,
            borderRadius: 8
          }]}
          value={content}
          onChangeText={handleContentChange}
          onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          multiline
          textAlignVertical="top"
          placeholder="Start typing..."
          placeholderTextColor="#3f3f46"
        />
      </ScrollView>

      <FormattingToolbarSheet 
        isVisible={showFormatting} onClose={() => setShowFormatting(false)}
        fontSize={fontSize} setFontSize={setFontSize}
        isBold={isBold} setIsBold={setIsBold}
        isItalic={isItalic} setIsItalic={setIsItalic}
        isUnderline={isUnderline} setIsUnderline={setIsUnderline}
        isStrike={isStrike} setIsStrike={setIsStrike}
        listType={listType} setListType={handleListToggle}
        highlightColor={highlightColor} setHighlightColor={setHighlightColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 64 },
  pillToolbar: { flexDirection: "row", backgroundColor: "#2d3440", borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8, gap: 15 },
  rightActions: { flexDirection: "row", gap: 18, alignItems: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  titleInput: { fontSize: 34, fontWeight: "800", color: "#ffffff", marginBottom: 8 },
  metadataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dateText: { fontSize: 14, color: "#3b82f6" },
  wordCount: { fontSize: 14, color: "#52525b" },
  noteInput: { color: "#d4d4d8", lineHeight: 26, flex: 1 },
});