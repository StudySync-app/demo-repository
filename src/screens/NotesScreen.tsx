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
  Share,
  Image,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import FormattingToolbarSheet from "../components/FormattingToolbarSheet";
import NoteRecorderCard from "../components/NoteRecorderCard";
import { addNote, getNoteById, updateNote } from "../db/notes";
import { getFolders } from "../db/folders";
import { getSetting } from "../db/settings";
import { notifyNewNote, scheduleNoteReviewReminder } from "../lib/notification";
import { summarizeStudyNotes } from "../lib/ai";

const DRAFT_KEY = "studysync.note.draft";

export default function NoteScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const noteId = route.params?.noteId as number | undefined;

  // Input States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [audioList, setAudioList] = useState<{ id: string; uri: string }[]>([]);
  const [imageList, setImageList] = useState<any[]>([]);
  const [videoList, setVideoList] = useState<any[]>([]);
  const [folderId, setFolderId] = useState<number | null>(null);

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

  useEffect(() => {
    if (!noteId) return;

    const note = getNoteById(noteId);
    if (!note) return;

    const parsedAudio = safeParseList(note.audioList);
    const parsedImages = safeParseList(note.imageList);
    const parsedVideos = safeParseList(note.videoList);

    setTitle(note.title ?? "");
    setContent(note.content ?? "");
    setAudioList(parsedAudio);
    setImageList(parsedImages);
    setVideoList(parsedVideos);
    setFolderId(note.folderId ?? null);
    setHistory([{ title: note.title ?? "", content: note.content ?? "", audioList: parsedAudio }]);
    setCurrentIndex(0);
  }, [noteId]);

  useEffect(() => {
    if (noteId) return;

    AsyncStorage.getItem(DRAFT_KEY).then((raw) => {
      if (!raw) return;
      try {
        const draft = JSON.parse(raw);
        setTitle(draft.title || "");
        setContent(draft.content || "");
        setAudioList(Array.isArray(draft.audioList) ? draft.audioList : []);
        setImageList(Array.isArray(draft.imageList) ? draft.imageList : []);
        setVideoList(Array.isArray(draft.videoList) ? draft.videoList : []);
      } catch {
        AsyncStorage.removeItem(DRAFT_KEY);
      }
    });
  }, [noteId]);

  useEffect(() => {
    if (noteId) return;
    const hasDraft = title.trim() || content.trim() || audioList.length || imageList.length || videoList.length;
    const timer = setTimeout(() => {
      if (!hasDraft) return;
      AsyncStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, content, audioList, imageList, videoList, updatedAt: new Date().toISOString() })
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [audioList, content, imageList, noteId, title, videoList]);

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
      if (listType === "bullet") newText = text + "- ";
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
    const prefix = type === "bullet" ? "- " : "1. ";
    let updatedContent = content;
    if (selection.start !== selection.end) {
      const selectedText = content.substring(selection.start, selection.end);
      const lines = selectedText.split("\n");
      const formatted = lines.map((line, i) => (type === "bullet" ? `- ${line}` : `${i + 1}. ${line}`)).join("\n");
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
      if (noteId) {
        await updateNote(noteId, title, content, audioList, imageList, videoList, folderId);
      } else {
        await addNote(title, content, audioList, imageList, videoList, folderId);
        await notifyNewNote(title.trim() || "Untitled note");
        await scheduleNoteReviewReminder(title.trim() || "Untitled note");
        await AsyncStorage.removeItem(DRAFT_KEY);
      }

      // 3. The "Clean Slate" Action
      // goBack() kills this screen instance. 
      // The next time you click "Add Note", the states above reset to "", "", and [].
      navigation.goBack();
    } catch (error) {
      console.error("Save failed:", error);
      Alert.alert("Error", "Could not save your note.");
    }
  };

  const buildExportName = (extension: "txt" | "pdf") => {
    const cleanTitle = (title.trim() || "StudySync Note")
      .replace(/[\\/:*?"<>|]/g, "")
      .slice(0, 48);
    return `${cleanTitle || "StudySync Note"}.${extension}`;
  };

  const exportText = async () => {
    const body = `${title.trim() || "Untitled note"}\n${currentDate}\n\n${content}`;
    const file = new File(Paths.cache, buildExportName("txt"));
    file.write(body);
    await Share.share({ title: title.trim() || "StudySync Note", message: body, url: file.uri });
  };

  const exportPdf = async () => {
    const safeTitle = escapePdfText(title.trim() || "Untitled note");
    const safeDate = escapePdfText(currentDate);
    const lines = wrapPdfLines(content || " ", 72).slice(0, 42);
    const textCommands = [
      "BT",
      "/F1 22 Tf",
      "72 760 Td",
      `(${safeTitle}) Tj`,
      "0 -28 Td",
      "/F1 11 Tf",
      `(${safeDate}) Tj`,
      "0 -28 Td",
      "/F1 12 Tf",
      ...lines.map((line) => `(${escapePdfText(line)}) Tj 0 -17 Td`),
      "ET",
    ].join("\n");

    const pdf = makeSimplePdf(textCommands);
    const file = new File(Paths.cache, buildExportName("pdf"));
    file.write(pdf);
    await Share.share({ title: title.trim() || "StudySync Note", message: "PDF exported from StudySync.", url: file.uri });
  };

  const handleExport = () => {
    Alert.alert("Export note", "Choose an export format.", [
      { text: "Plain text", onPress: () => exportText().catch(() => Alert.alert("Export failed", "Could not export this note.")) },
      { text: "PDF", onPress: () => exportPdf().catch(() => Alert.alert("Export failed", "Could not export this note as PDF.")) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handlePickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to your media library to insert files.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) return;

    const images = result.assets
      .filter((asset) => asset.type !== "video")
      .map((asset) => ({ id: `${Date.now()}-${asset.assetId || asset.uri}`, uri: asset.uri, name: asset.fileName || "Image" }));
    const videos = result.assets
      .filter((asset) => asset.type === "video")
      .map((asset) => ({ id: `${Date.now()}-${asset.assetId || asset.uri}`, uri: asset.uri, name: asset.fileName || "Video" }));

    setImageList((current) => [...images, ...current]);
    setVideoList((current) => [...videos, ...current]);
  };

  const handlePickAudio = async () => {
    try {
      const picked = await File.pickFileAsync(undefined, "audio/*");
      const file = Array.isArray(picked) ? picked[0] : picked;
      if (!file) return;
      const next = [{ id: Date.now().toString(), uri: file.uri, name: file.name || "Audio" }, ...audioList];
      setAudioList(next);
      updateHistory(title, content, next);
    } catch {
      Alert.alert("Audio import failed", "Could not attach the selected audio file.");
    }
  };

  const handleSummarize = async () => {
    if (!getSetting("aiSummarizeEnabled", false)) {
      Alert.alert("AI summarization is off", "Turn on AI note summarization in Settings > StudySync AI before using it.");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Nothing to summarize", "Add note content first.");
      return;
    }

    try {
      const summary = await summarizeStudyNotes(content);
      setContent((current) => `${current.trim()}\n\nSummary\n${summary}`.trim());
    } catch (error: any) {
      Alert.alert("AI summary failed", error.message || "Could not summarize this note.");
    }
  };

  const handleFolderPress = () => {
    const folders = getFolders();
    if (folders.length === 0) {
      Alert.alert("No folders yet", "Create a folder from Home or while adding a to-do/media file, then assign notes here.");
      return;
    }

    Alert.alert(
      "Save note to folder",
      "Choose a folder for this note.",
      [
        ...folders.slice(0, 6).map((folder) => ({
          text: folder.name,
          onPress: () => setFolderId(folder.id),
        })),
        { text: "Remove folder", onPress: () => setFolderId(null), style: "destructive" as const },
        { text: "Open folders", onPress: () => navigation.navigate("FolderedNotesManager") },
        { text: "Cancel", style: "cancel" as const },
      ]
    );
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
          <TouchableOpacity onPress={handlePickMedia}><Ionicons name="shapes-outline" size={20} color="#fff" /></TouchableOpacity>
          <TouchableOpacity onPress={handleFolderPress}><Ionicons name="folder-open-outline" size={20} color={folderId ? "#60A5FA" : "#fff"} /></TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={handleSummarize}>
            <Ionicons name="sparkles-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
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

          {imageList.map((image) => (
            <Image key={image.id || image.uri} source={{ uri: image.uri }} style={styles.imageAttachment} />
          ))}

          {videoList.map((video) => (
            <TouchableOpacity key={video.id || video.uri} style={styles.fileAttachment} onPress={() => Linking.openURL(video.uri)}>
              <Ionicons name="play-circle-outline" size={28} color="#fff" />
              <Text style={styles.fileAttachmentText} numberOfLines={1}>{video.name || "Attached video"}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.fileAttachment} onPress={handlePickAudio}>
            <Ionicons name="musical-note-outline" size={24} color="#fff" />
            <Text style={styles.fileAttachmentText}>Attach audio file</Text>
          </TouchableOpacity>
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

function safeParseList(value?: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\r?\n/g, " ");
}

function wrapPdfLines(value: string, width: number) {
  const words = value.replace(/\r/g, "").split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if ((line + " " + word).trim().length > width) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }

  if (line.trim()) lines.push(line.trim());
  return lines.length ? lines : [" "];
}

function makeSimplePdf(stream: string) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((obj, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    body += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return body;
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
  imageAttachment: { width: "100%", height: 180, borderRadius: 16, marginBottom: 10, backgroundColor: "#1c1c1e" },
  fileAttachment: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#1c1c1e", borderRadius: 16, padding: 14, marginBottom: 10 },
  fileAttachmentText: { color: "#ffffff", flex: 1, fontWeight: "600" },
});
