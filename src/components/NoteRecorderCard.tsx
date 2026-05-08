import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  useAudioRecorder, 
  AudioModule, 
  useAudioRecorderState, 
  RecordingPresets,
  useAudioPlayer,
} from 'expo-audio';

interface Props {
  onStopRecording: (uri: string | null) => void;
  isCompleted?: boolean;
  uri?: string | null;
}

export default function NoteRecorderCard({ onStopRecording, isCompleted, uri }: Props) {
  // Use the preset to satisfy all required configuration types
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  
  // We keep this to force a re-render when the recorder updates
  const recorderState = useAudioRecorderState(recorder);
  
  const player = useAudioPlayer(uri || null);

  useEffect(() => {
    if (!isCompleted) {
      handleInitialStart();
    }
    return () => {
      if (recorder.isRecording) recorder.stop();
    };
  }, []);

  const handleInitialStart = async () => {
    const permissions = await AudioModule.requestRecordingPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert("Permission Denied", "Microphone access is required.");
      return;
    }
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      console.error("Start error:", err);
    }
  };

  const handleStop = async () => {
    await recorder.stop();
    onStopRecording(recorder.uri);
  };

  const handlePauseResume = () => {
    if (recorder.isRecording) {
      recorder.pause();
    } else {
      recorder.record();
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const s = Math.floor(totalSeconds % 60);
    const m = Math.floor((totalSeconds / 60) % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.card, isCompleted && styles.completedCard]}>
      <View style={styles.infoSection}>
        <MaterialCommunityIcons 
          name={isCompleted ? "microphone-outline" : "microphone"} 
          size={20} 
          color={isCompleted ? "#3b82f6" : "#ef4444"} 
        />
        <Text style={styles.timer}>
          {/* FIX: Access duration directly from the recorder and use casting to avoid TS check if needed */}
          {isCompleted ? "Voice Note" : formatTime((recorder as any).duration || 0)}
        </Text>
      </View>

      <View style={styles.controls}>
        {!isCompleted ? (
          <>
            <TouchableOpacity onPress={handlePauseResume} style={styles.iconButton}>
              <MaterialCommunityIcons 
                name={recorder.isRecording ? "pause" : "play"} 
                size={28} 
                color="#fff" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleStop} style={styles.iconButton}>
              <MaterialCommunityIcons name="stop" size={28} color="#ef4444" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={() => player.play()} style={styles.iconButton}>
            <MaterialCommunityIcons name="play-circle" size={32} color="#3b82f6" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1c1c1e', borderRadius: 14, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#2d2d30', marginVertical: 10 },
  completedCard: { borderColor: '#3b82f6', backgroundColor: '#0f172a' },
  infoSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timer: { color: '#fff', fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { padding: 4 },
});