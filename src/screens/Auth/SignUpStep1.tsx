import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome as Icon, MaterialIcons as IconMat } from '@expo/vector-icons';

type RootStackParamList = { SignUpStep1: undefined; SignUpStep2: { fullName: string; email: string } };
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SignUpStep1">;
type Props = { navigation: NavigationProp };

export default function SignUpStep1({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconMat name="arrow-back" size={24} color="#fff" onPress={() => navigation.goBack()} />
        <Text style={styles.logoText}>StudySync</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.mainTitle}>Together, let's turn your goals into progress.</Text>
        <Text style={styles.subtitle}>
          Create your personal space for learning and productivity. Sign up by entering your name and email to begin.
        </Text>

        <View style={styles.inputGroup}>
          <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#555" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#555" value={email} onChangeText={setEmail} autoCapitalize="none" />
        </View>

        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => navigation.navigate("SignUpStep2", { fullName: name, email })}>
          <Text style={styles.btnOutlineText}>Next</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sign in options</Text>
          <View style={styles.socialIcons}>
            <Icon name="google" size={28} color="#DB4437" />
            <Icon name="github" size={28} color="#fff" style={{ marginHorizontal: 24 }} />
            <Icon name="facebook" size={28} color="#4267B2" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000", padding: 24, paddingTop: 60 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 40 },
  logoText: { color: "#ffffff", fontSize: 20, fontWeight: "bold", marginLeft: 16 },
  mainTitle: { color: "#ffffff", fontSize: 32, fontWeight: "bold", lineHeight: 40, marginBottom: 16 },
  subtitle: { color: "#a1a1aa", fontSize: 14, lineHeight: 22, marginBottom: 40 },
  inputGroup: { marginBottom: 20, gap: 12 },
  input: { backgroundColor: "#0a0a0a", borderWidth: 1, borderColor: "#27272a", color: "#fff", height: 50, borderRadius: 25, paddingHorizontal: 24, textAlign: "center", fontSize: 16 },
  btn: { width: "100%", height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  btnOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#3f3f46" },
  btnOutlineText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  footer: { alignItems: "center", marginTop: 40, marginBottom: 20 },
  footerText: { color: "#a1a1aa", fontSize: 12, marginBottom: 16 },
  socialIcons: { flexDirection: "row", alignItems: "center" },
  contentContainer: { paddingBottom: 20 }
});