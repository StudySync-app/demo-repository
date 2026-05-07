import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";
import IconMat from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";

type RootStackParamList = { Login: undefined; MainTabs: undefined; SignUpStep1: undefined };
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;
type Props = { navigation: NavigationProp };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) navigation.replace("MainTabs");
    else alert(error.message);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconMat name="arrow-back" size={22} color="#fff" onPress={() => navigation.goBack()} />
        <Text style={styles.logoText}>StudySync</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.mainTitle}>Together, let's turn your goals into progress.</Text>
        <Text style={styles.subtitle}>
          Your personal space for{'\n'}
          learning and productivity. Log{'\n'}
          in to continue your journey.
        </Text>

        <View style={styles.inputGroup}>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#52525b" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#52525b" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleLogin}>
          <Text style={styles.btnPrimaryText}>Sign in</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sign in options</Text>
          <View style={styles.socialIcons}>
            <Icon name="google" size={26} color="#DB4437" />
            <Icon name="github" size={26} color="#fff" style={{ marginHorizontal: 24 }} />
            <Icon name="facebook" size={26} color="#4267B2" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000", paddingHorizontal: 24, paddingTop: 50 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 48 },
  logoText: { color: "#ffffff", fontSize: 18, fontWeight: "600", letterSpacing: 0.5, marginLeft: 14 },
  mainTitle: { color: "#ffffff", fontSize: 34, fontWeight: "800", lineHeight: 40, marginBottom: 18 },
  subtitle: { color: "#9ca3af", fontSize: 15, lineHeight: 21, marginBottom: 36 },
  inputGroup: { marginBottom: 24, gap: 14 },
  input: { backgroundColor: "#0a0a0a", borderWidth: 1, borderColor: "#27272a", color: "#fff", height: 52, borderRadius: 99, paddingHorizontal: 24, textAlign: "center", fontSize: 15 },
  btn: { width: "100%", height: 52, borderRadius: 99, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  btnPrimary: { backgroundColor: "#3b82f6" },
  btnPrimaryText: { color: "#000000", fontSize: 16, fontWeight: "600" },
  footer: { alignItems: "center", marginTop: 48, marginBottom: 24 },
  footerText: { color: "#6b7280", fontSize: 11, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  socialIcons: { flexDirection: "row", alignItems: "center" },
  contentContainer: { paddingBottom: 20 }
});