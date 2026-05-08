import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  useAudioRecorder, 
  useAudioRecorderState, 
  useAudioPlayer, 
  useAudioPlayerStatus, 
  RecordingPresets,
  AudioModule 
} from 'expo-audio';
import Slider from '@react-native-community/slider';

interface Props {
  onStopRecording: (uri: string | null) => void;
  isCompleted?: boolean;
  uri?: string | null;
}

export default function NoteRecorderCard({ onStopRecording, isCompleted, uri }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderStatus = useAudioRecorderState(recorder);
  const player = useAudioPlayer(uri || null);
  const playerStatus = useAudioPlayerStatus(player);

  const [customTitle, setCustomTitle] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds / 60) % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (isCompleted && !customTitle && (playerStatus.duration || 0) > 0) {
      const now = new Date();
      const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCustomTitle(`${dateStr}, ${timeStr}`);
    }
  }, [isCompleted, playerStatus.duration]);

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) return;
      await recorder.prepareToRecordAsync();
      setTimeout(async () => { await recorder.record(); }, 150);
    } catch (err) { console.error(err); }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      onStopRecording(recorder.uri); 
    } catch (err) { console.error(err); }
  };

  // --- STATE 1: ACTIVE RECORDING UI ---
  if (!isCompleted) {
    return (
      <View style={styles.card}>
        <Text style={styles.timer}>{formatTime(recorderStatus.durationMillis || 0)}</Text>
        <View style={styles.controls}>
          {recorderStatus.isRecording ? (
            <TouchableOpacity onPress={stopRecording}>
              <Ionicons name="stop-circle" size={56} color="#ef4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startRecording}>
              <Ionicons name="mic-circle" size={56} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // --- STATE 2: FINISHED / COLLAPSIBLE PLAYBACK UI ---
  return (
    <Pressable 
      style={[styles.card, isExpanded && styles.expandedCard]} 
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TextInput
            style={styles.editableTitle}
            value={customTitle}
            onChangeText={setCustomTitle}
            placeholder="Recording Name"
            placeholderTextColor="#71717a"
            pointerEvents="none" // Card press handles expansion
          />
          <Text style={styles.subText}>
            {isExpanded 
              ? `${formatTime(((playerStatus as any).currentTime || 0) * 1000)} / ${formatTime(((playerStatus as any).duration || 0) * 1000)}` 
              : formatTime(((playerStatus as any).duration || 0) * 1000)}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation(); // Prevents card from collapsing when hitting play
            setIsExpanded(true);
            playerStatus.playing ? player.pause() : player.play();
          }}
        >
          <Ionicons 
            name={playerStatus.playing ? "pause-circle" : "play-circle"} 
            size={44} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={playerStatus.duration}
          value={playerStatus.currentTime}
          onSlidingComplete={(val) => player.seekTo(val)}
          minimumTrackTintColor="#f59e0b"
          maximumTrackTintColor="#3f3f46"
          thumbTintColor="#fff"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, marginVertical: 8, borderWidth: 1, borderColor: '#2c2c2e' },
  expandedCard: { borderColor: '#f59e0b', backgroundColor: '#242427' },
  timer: { color: '#fff', fontSize: 36, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleContainer: { flex: 1, marginRight: 10 },
  editableTitle: { color: '#fff', fontSize: 16, fontWeight: '600', padding: 0, marginBottom: 2 },
  subText: { color: '#71717a', fontSize: 13 },
  controls: { alignItems: 'center', justifyContent: 'center' },
  slider: { width: '100%', height: 40, marginTop: 10 },
});