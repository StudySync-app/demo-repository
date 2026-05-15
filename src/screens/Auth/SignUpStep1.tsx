import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Linking } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome as Icon, MaterialIcons as IconMat } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";

type RootStackParamList = { 
  SignUpStep1: undefined; 
  SignUpStep2: { fullName: string; email: string };
  SignUpStep3: { fullName: string; email: string };
  Login: undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SignUpStep1">;
type Props = { navigation: NavigationProp };

export default function SignUpStep1({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setError(null);
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("SignUpStep3", { fullName: name.trim(), email: email.trim() });
    }, 500);
  };

  const handleSocialSignUp = async (provider: "google" | "github" | "facebook") => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { skipBrowserRedirect: true },
      });

      if (oauthError) throw oauthError;
      if (!data?.url) throw new Error("Could not start social sign up.");
      await Linking.openURL(data.url);
    } catch (err: any) {
      setError(err.message || "Social sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconMat name="arrow-back" size={24} color="#94A3B8" onPress={() => navigation.goBack()} />
        <Text style={styles.logoText}>StudySync</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.mainTitle}>Let's get started.</Text>
        <Text style={styles.subtitle}>
          Create your personal space for learning and productivity.{"\n"}
          Sign up by entering your name and email to begin.
        </Text>

        <View style={styles.inputGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Full Name" 
            placeholderTextColor="#64748B" 
            value={name} 
            onChangeText={(text) => { setName(text); setError(null); }} 
            autoCapitalize="words"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Email Address" 
            placeholderTextColor="#64748B" 
            value={email} 
            onChangeText={(text) => { setEmail(text); setError(null); }} 
            autoCapitalize="none" 
            keyboardType="email-address"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.btnPrimary, loading && { opacity: 0.7 }]} 
          onPress={handleNext}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnPrimaryText}>Next Step</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Or sign up with</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialSignUp("google")}><Icon name="google" size={24} color="#DB4437" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialSignUp("github")}><Icon name="github" size={24} color="#E5E7EB" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialSignUp("facebook")}><Icon name="facebook" size={24} color="#3B82F6" /></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 24, paddingTop: 60 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 40 },
  logoText: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold", marginLeft: 12 },
  mainTitle: { color: "#FFFFFF", fontSize: 38, fontWeight: "bold", lineHeight: 46, marginBottom: 16 },
  subtitle: { color: "#94A3B8", fontSize: 15, lineHeight: 24, marginBottom: 40 },
  inputGroup: { marginBottom: 16, gap: 16 },
  input: { 
    backgroundColor: "#1E293B", 
    borderWidth: 1, 
    borderColor: "#334155", 
    color: "#FFFFFF", 
    height: 52, 
    borderRadius: 26, 
    paddingHorizontal: 20, 
    fontSize: 16 
  },
  btnPrimary: { 
    width: "100%", 
    height: 52, 
    borderRadius: 26, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#60A5FA", 
    marginBottom: 12,
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  btnPrimaryText: { color: "#0F172A", fontSize: 16, fontWeight: "600" },
  errorText: { 
    color: "#F87171", 
    fontSize: 14, 
    textAlign: "center", 
    marginBottom: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  footer: { alignItems: "center", marginTop: 32, marginBottom: 20 },
  footerText: { color: "#64748B", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  socialIcons: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 24 },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  loginLink: { color: "#60A5FA", fontSize: 14, fontWeight: "600", marginTop: 16 },
  contentContainer: { paddingBottom: 20 }
});
