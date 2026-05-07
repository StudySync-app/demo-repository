import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface NoteRecorderCardProps {
  onStopRecording: (uri: string | null) => void;
}

export default function NoteRecorderCard({ onStopRecording }: NoteRecorderCardProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor(totalSeconds / 3600);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsPaused(false);

      recording.setOnRecordingStatusUpdate((status) => {
        setDurationMillis(status.durationMillis);
      });
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function pauseResumeRecording() {
    if (!recording) return;

    try {
      if (isPaused) {
        // Using 'as any' to bypass the TypeScript Property 'resumeAsync' error
        await (recording as any).resumeRecordingAsync();
        setIsPaused(false);
      } else {
        // Using 'as any' to bypass the TypeScript Property 'pauseAsync' error
        await (recording as any).pauseRecordingAsync();
        setIsPaused(true);
      }
    } catch (error) {
      console.error("Pause/Resume error", error);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setDurationMillis(0);
      onStopRecording(uri);
    } catch (error) {
      console.error("Stop error", error);
    }
  }

  useEffect(() => {
    startRecording();
  }, []);

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.timerText}>{formatTime(durationMillis)}</Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={stopRecording} style={styles.iconButton}>
          <MaterialCommunityIcons name="stop-circle-outline" size={36} color="#ef4444" />
        </TouchableOpacity>

        <TouchableOpacity onPress={pauseResumeRecording} style={styles.iconButton}>
          <MaterialCommunityIcons 
            name={isPaused ? "play-circle-outline" : "pause-circle-outline"} 
            size={36} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2d2d30'
  },
  timerText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 5,
  },
});