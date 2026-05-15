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
import NoteRecorderCard from "../components/NoteRecorderCard";
import { addNote } from "../db/notes";


export default function NoteScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // Input States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [audioList, setAudioList] = useState<{ id: string; uri: string }[]>([]);
  const [imageList, setImageList] = useState<any[]>([]);
  const [videoList, setVideoList] = useState<any[]>([]);

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
  const [isRecording, setIsRecording] = useState(false);

  // History Logic (Now tracking audioList)
  const [history, setHistory] = useState([{ title: "", content: "", audioList: [] as any[] }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isInternalChange = useRef(false);

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: "long", day: "numeric", weekday: "short",
      hour: "numeric", minute: "2-digit", hour12: true
    };
    setCurrentDate(now.toLocaleString("en-US", options).replace(/,/g, ""));
  }, []);

  // --- History Management ---
  const updateHistory = (t: string, c: string, aL: any[]) => {
    if (isInternalChange.current) { isInternalChange.current = false; return; }
    
    const nextHistory = history.slice(0, currentIndex + 1);
    const newState = { title: t, content: c, audioList: [...aL] };
    
    if (JSON.stringify(nextHistory[nextHistory.length - 1]) !== JSON.stringify(newState)) {
      setHistory([...nextHistory, newState]);
      setCurrentIndex(nextHistory.length);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      isInternalChange.current = true;
      const prev = history[currentIndex - 1];
      setTitle(prev.title);
      setContent(prev.content);
      setAudioList(prev.audioList);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      isInternalChange.current = true;
      const nextState = history[currentIndex + 1];
      setTitle(nextState.title);
      setContent(nextState.content);
      setAudioList(nextState.audioList);
      setCurrentIndex(currentIndex + 1);
    }
  };

  // --- Audio Handlers ---
  const handleFinishedRecording = (uri: string | null) => {
    if (uri) {
      const newList = [{ id: Date.now().toString(), uri }, ...audioList];
      setAudioList(newList);
      updateHistory(title, content, newList);
    }
    setIsRecording(false);
  };

  // --- Content Handlers ---
  const handleContentChange = (text: string) => {
    let newText = text;
    if (text.length > content.length && text.endsWith("\n")) {
      if (listType === "bullet") newText = text + "• ";
      else if (listType === "number") {
        const lineCount = text.split("\n").length - 1;
        newText = text + `${lineCount}. `;
      }
    }
    setContent(newText);
    updateHistory(title, newText, audioList);
  };

  const handleListToggle = (type: "none" | "bullet" | "number") => {
    if (type === "none" || type === listType) {
      setListType("none");
      return;
    }
    const prefix = type === "bullet" ? "• " : "1. ";
    let updatedContent = content;
    if (selection.start !== selection.end) {
      const selectedText = content.substring(selection.start, selection.end);
      const lines = selectedText.split("\n");
      const formatted = lines.map((line, i) => (type === "bullet" ? `• ${line}` : `${i + 1}. ${line}`)).join("\n");
      updatedContent = content.substring(0, selection.start) + formatted + content.substring(selection.end);
    } else if (content.length === 0 || content.charAt(selection.start - 1) === "\n" || selection.start === 0) {
      updatedContent = content.substring(0, selection.start) + prefix + content.substring(selection.start);
    }
    setContent(updatedContent);
    setListType(type);
    updateHistory(title, updatedContent, audioList);
  };

  const handleInputKeyPress = (e: any) => {
    const { key } = e.nativeEvent;
    if (key === 'Backspace' && selection.start === 0 && audioList.length > 0) {
      const newList = audioList.slice(1);
      setAudioList(newList);
      updateHistory(title, content, newList);
    }
  };

  const handleSave = async () => {
    // 1. Check if there's anything to save
    const isEmpty = !title.trim() && !content.trim() && 
                    audioList.length === 0 && imageList.length === 0 && 
                    videoList.length === 0;
  
    if (isEmpty) {
      Alert.alert("Empty Note", "Please add some content before saving.");
      return;
    }
  
    try {
      // 2. Save to Database
      await addNote(title, content, audioList, imageList, videoList);

      // 3. The "Clean Slate" Action
      // goBack() kills this screen instance. 
      // The next time you click "Add Note", the states above reset to "", "", and [].
      navigation.goBack();
    } catch (error) {
      console.error("Save failed:", error);
      Alert.alert("Error", "Could not save your note.");
    }
  };
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.pillToolbar}>
          <TouchableOpacity onPress={() => setShowFormatting(true)}>
            <Ionicons name="text-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsRecording(!isRecording)}>
            <Ionicons name={isRecording ? "mic" : "mic-outline"} size={20} color={isRecording ? "#ef4444" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity><Ionicons name="shapes-outline" size={20} color="#fff" /></TouchableOpacity>
          <TouchableOpacity><Ionicons name="folder-open-outline" size={20} color="#fff" /></TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={handleUndo} disabled={currentIndex === 0}>
            <Ionicons name="arrow-undo-outline" size={22} color={currentIndex === 0 ? "#3f3f46" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRedo} disabled={currentIndex === history.length - 1}>
            <Ionicons name="arrow-redo-outline" size={22} color={currentIndex === history.length - 1 ? "#3f3f46" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Ionicons name="checkmark" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          placeholderTextColor="#52525b"
          value={title}
          onChangeText={(t) => { setTitle(t); updateHistory(t, content, audioList); }}
          multiline
        />

        <View style={styles.metadataRow}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.wordCount}>{content.trim() ? content.trim().split(/\s+/).length : 0} words</Text>
        </View>

        <View style={styles.attachmentWrapper}>
          {isRecording && (
            <NoteRecorderCard 
              onStopRecording={handleFinishedRecording}
              isCompleted={false} 
            />
          )}

          {audioList.map((audio) => (
            <NoteRecorderCard 
              key={audio.id}
              uri={audio.uri}
              isCompleted={true}
              onStopRecording={() => {}} 
            />
          ))}
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
          onKeyPress={handleInputKeyPress}
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
  noteInput: { color: "#d4d4d8", lineHeight: 26, flex: 1, minHeight: 200 },
  attachmentWrapper: { width: '100%', marginBottom: 15 },
});

function saveNote(noteData: {
  id: string; // Or let your DB generate this
  title: string; content: string; audioList: { id: string; uri: string; }[]; // Saving the unlimited audios array
  createdAt: string; isArchived: boolean;
}) {
  throw new Error("Function not implemented.");
}
