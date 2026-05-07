import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface Props {
  isVisible: boolean; onClose: () => void;
  fontSize: number; setFontSize: (s: any) => void;
  isBold: boolean; setIsBold: (v: boolean) => void;
  isItalic: boolean; setIsItalic: (v: boolean) => void;
  isUnderline: boolean; setIsUnderline: (v: boolean) => void;
  isStrike: boolean; setIsStrike: (v: boolean) => void;
  listType: "none" | "bullet" | "number"; setListType: (t: any) => void;
  highlightColor: string; setHighlightColor: (c: string) => void;
}

export default function FormattingToolbarSheet(props: Props) {
  if (!props.isVisible) return null;

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.backdrop} onPress={props.onClose} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => props.setListType("bullet")} style={[styles.iconBtn, props.listType === "bullet" && styles.activeCircle]}>
              <MaterialIcons name="format-list-bulleted" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.setListType("number")} style={[styles.iconBtn, props.listType === "number" && styles.activeCircle]}>
              <MaterialIcons name="format-list-numbered" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={props.onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
        </View>

        <View style={styles.styleRow}>
          <TouchableOpacity onPress={() => props.setIsBold(!props.isBold)} style={[styles.styleBtn, props.isBold && styles.activeBtn]}><Text style={styles.styleTextBold}>B</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => props.setIsItalic(!props.isItalic)} style={[styles.styleBtn, props.isItalic && styles.activeBtn]}><Text style={styles.styleTextItalic}>I</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => props.setIsUnderline(!props.isUnderline)} style={[styles.styleBtn, props.isUnderline && styles.activeBtn]}><Text style={styles.styleTextUnderline}>U</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => props.setIsStrike(!props.isStrike)} style={[styles.styleBtn, props.isStrike && styles.activeBtn]}><Text style={styles.styleTextStrike}>S</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => props.setHighlightColor(props.highlightColor === "transparent" ? "#3b82f6" : "transparent")} style={[styles.styleBtn, props.highlightColor !== "transparent" && styles.activeBtn]}>
            <MaterialIcons name="colorize" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sizeRow}>
          <Text style={styles.label}>Font Size</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => props.setFontSize((p:any)=>Math.max(p-2,12))}><Ionicons name="remove" size={20} color="#fff" /></TouchableOpacity>
            <Text style={styles.sizeVal}>{props.fontSize}</Text>
            <TouchableOpacity onPress={() => props.setFontSize((p:any)=>Math.min(p+2,40))}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { ...StyleSheet.absoluteFillObject, zIndex: 1000, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  container: { backgroundColor: '#1c1c1e', padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  row: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 8 },
  activeCircle: { backgroundColor: '#3b82f6', borderRadius: 20 },
  styleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  styleBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  activeBtn: { backgroundColor: '#3b82f6' },
  styleTextBold: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  styleTextItalic: { color: '#fff', fontSize: 22, fontStyle: 'italic' },
  styleTextUnderline: { color: '#fff', fontSize: 22, textDecorationLine: 'underline' },
  styleTextStrike: { color: '#fff', fontSize: 22, textDecorationLine: 'line-through' },
  sizeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#fff', fontSize: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2d2d30', borderRadius: 12, padding: 4 },
  sizeVal: { color: '#fff', fontSize: 18, marginHorizontal: 15, fontWeight: '600' }
});