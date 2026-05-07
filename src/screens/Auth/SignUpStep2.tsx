import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import IconMat from "react-native-vector-icons/MaterialIcons";

type RootStackParamList = {
  SignUpStep2: { fullName: string; email: string };
  SignUpStep3: { fullName: string; email: string; role: string };
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SignUpStep2">;
type RoutePropType = RouteProp<RootStackParamList, "SignUpStep2">;
type Props = { navigation: NavigationProp; route: RoutePropType };

export default function SignUpStep2({ navigation, route }: any) {
  const [role, setRole] = useState("");

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

        <View style={styles.btnGroup}>
          <TouchableOpacity style={[styles.btn, role === "student" && styles.btnActive]} onPress={() => setRole("student")}>
            <Text style={styles.btnText}>I am a student</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, role === "teacher" && styles.btnActive]} onPress={() => setRole("teacher")}>
            <Text style={styles.btnText}>I am a teacher</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, role === "independent" && styles.btnActive]} onPress={() => setRole("independent")}>
            <Text style={styles.btnText}>I am an independent learner</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.btn, styles.btnPrimary, !role && styles.btnDisabled]} onPress={() => navigation.navigate("SignUpStep3", { ...route.params, role })} disabled={!role}>
          <Text style={styles.btnPrimaryText}>Next</Text>
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
  btnGroup: { marginBottom: 20, gap: 12 },
  btn: { width: "100%", height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#3f3f46", backgroundColor: "transparent" },
  btnActive: { borderColor: "#3b82f6", backgroundColor: "#1a1a1a" },
  btnPrimary: { backgroundColor: "#3b82f6", borderWidth: 0 },
  btnPrimaryText: { color: "#000000", fontSize: 16, fontWeight: "bold" },
  btnText: { color: "#ffffff", fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
  footer: { alignItems: "center", marginTop: 40, marginBottom: 20 },
  footerText: { color: "#a1a1aa", fontSize: 12, marginBottom: 16 },
  socialIcons: { flexDirection: "row", alignItems: "center" },
  contentContainer: { paddingBottom: 20 }
});