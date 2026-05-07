import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUpStep1: undefined;
  MainTabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Welcome">;
type Props = { navigation: NavigationProp };

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>StudySync</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.mainTitle}>Together, let's turn your goals into progress.</Text>
        <Text style={styles.subtitle}>
          Your all-in-one space for{'\n'}
          learning, organizing, and{'\n'}
          staying productive; designed{'\n'}
          to help you succeed from day{'\n'}
          one.
        </Text>

        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.btnPrimaryText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => navigation.navigate("SignUpStep1")}>
          <Text style={styles.btnOutlineText}>Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Forgot password</Text>
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
  header: { marginBottom: 48 },
  logoText: { color: "#ffffff", fontSize: 18, fontWeight: "600", letterSpacing: 0.5 },
  mainTitle: { color: "#ffffff", fontSize: 34, fontWeight: "800", lineHeight: 40, marginBottom: 18 },
  subtitle: { color: "#9ca3af", fontSize: 15, lineHeight: 21, marginBottom: 36 },
  btn: { width: "100%", height: 52, borderRadius: 99, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  btnPrimary: { backgroundColor: "#3b82f6" },
  btnPrimaryText: { color: "#000000", fontSize: 16, fontWeight: "600" },
  btnOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#27272a" },
  btnOutlineText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  linkButton: { alignSelf: "center", marginVertical: 14 },
  linkText: { color: "#ffffff", fontSize: 13, textDecorationLine: "none" },
  footer: { alignItems: "center", marginTop: 48, marginBottom: 24 },
  footerText: { color: "#6b7280", fontSize: 11, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  socialIcons: { flexDirection: "row", alignItems: "center" },
  contentContainer: { paddingBottom: 20 }
});