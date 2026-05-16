import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';

interface CreateFolderSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (folderName: string, category: string) => void;
  folders?: { id: number; name: string; category?: string | null }[];
  selectedFolderId?: number | null;
  onSelectFolder?: (folderId: number | null) => void;
}

export const CreateFolderSheet = ({ isVisible, onClose, onCreate, folders = [], selectedFolderId = null, onSelectFolder }: CreateFolderSheetProps) => {
  const { height: screenHeight } = useWindowDimensions();
  const [folderName, setFolderName] = useState('');

  const handleCreate = () => {
    const name = folderName.trim();
    if (!name) return;

    onCreate(name, 'General');
    setFolderName('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* Backdrop - Clicking this closes the modal */}
      <Pressable style={styles.overlay} onPress={onClose} />

      <KeyboardAvoidingView
        // 'padding' is better for iOS, 'height' usually works better for Android bottom sheets
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // Offset helps push the sheet higher if the keyboard still blocks the input
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -20} 
        style={styles.keyboardView}
      >
        <View style={[styles.sheetContainer, { height: screenHeight * 0.4 }]}>
          {/* Top Grab Handle */}
          <View style={styles.handle} />

          <View style={styles.headerRow}>
             <Text style={styles.sheetTitle}>New folder for to do's</Text>
          </View>

          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Folder name"
              placeholderTextColor="#94A3B8"
              value={folderName}
              onChangeText={setFolderName}
              autoFocus={isVisible}
              cursorColor="#4B76E7"
            />
          </View>

          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreate}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>Create folder</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  keyboardView: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  sheetContainer: {
    backgroundColor: '#0A0E1A', // Matched to TasksScreen BG
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  headerRow: {
    width: '100%',
    marginBottom: 20,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  folderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  folderChip: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  folderChipActive: {
    backgroundColor: '#102A4E',
    borderColor: '#4B76E7',
  },
  folderChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  folderChipTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#111827', // Matched to TasksScreen input color
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  description: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    width: '100%',
  },
  categoryRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  categoryBtn: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryBtnActive: {
    backgroundColor: '#4B76E7', // Matched to ACCENT
    borderColor: '#4B76E7',
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  createButton: {
    width: '100%',
    backgroundColor: '#4B76E7',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
