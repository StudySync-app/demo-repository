import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Animated, Easing, Linking } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
// Switch to @expo/vector-icons for consistency
import { FontAwesome as Icon, MaterialIcons as IconMat } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";

type RootStackParamList = { 
  SignUpStep3: { fullName: string; email: string; role?: string }; 
  MainTabs: undefined;
  Login: undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SignUpStep3">;
type RoutePropType = RouteProp<RootStackParamList, "SignUpStep3">;
type Props = { navigation: NavigationProp; route: RoutePropType };

export default function SignUpStep3({ navigation, route }: any) {
  const { fullName, email } = route.params;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.3))[0];
  const checkAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(50))[0];

  const handleSignUp = async () => {
    setError(null);
    if (!password) { setError("Please enter a password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: { data: { full_name: fullName.trim() } },
      });

      if (signUpError) throw signUpError;
      if (!data?.user) throw new Error("Sign up failed. Please try again.");
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error("Email already in use. Please sign in.");
      }

      setShowSuccess(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.back(1.2)) }),
        Animated.timing(slideUpAnim, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
      setTimeout(() => {
        Animated.timing(checkAnim, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.elastic(1)) }).start();
      }, 300);
    } catch (err: any) {
      let msg = "Failed to create account.";
      if (err.message?.includes("User already registered")) msg = "Email already in use. Please sign in.";
      else if (err.message) msg = err.message;
      setError(msg);
    } finally { setLoading(false); }
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

  const handleSignInNow = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
    ]).start(() => { setShowSuccess(false); navigation.replace("Login"); });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconMat name="arrow-back" size={24} color="#94A3B8" onPress={() => navigation.goBack()} />
        <Text style={styles.logoText}>StudySync</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.mainTitle}>Create your password</Text>
        <Text style={styles.subtitle}>Set a secure password to complete your account.</Text>
        <View style={styles.inputGroup}>
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#64748B" value={password} onChangeText={t => { setPassword(t); setError(null); }} secureTextEntry autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Confirm password" placeholderTextColor="#64748B" value={confirm} onChangeText={t => { setConfirm(t); setError(null); }} secureTextEntry autoCapitalize="none" />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={[styles.btnPrimary, loading && { opacity: 0.7 }]} onPress={handleSignUp} disabled={loading} activeOpacity={0.9}>
          {loading ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnPrimaryText}>Create Account</Text>}
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

      {/* Success Modal */}
      <Modal transparent visible={showSuccess} animationType="none" onRequestClose={() => setShowSuccess(false)}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.modalContent, { opacity: scaleAnim, transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }] }]}>
            <View style={styles.iconContainer}>
              <Animated.View style={[styles.successCircle, { transform: [{ scale: checkAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.2, 1] }) }] }]}>
                <Animated.View style={[styles.checkmark, { opacity: checkAnim, transform: [{ scale: checkAnim }] }]}>
                  <IconMat name="check-circle" size={50} color="#10B981" />
                </Animated.View>
              </Animated.View>
              <Animated.View style={[styles.ripple, { opacity: checkAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.6, 0] }), transform: [{ scale: checkAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.8, 1.5] }) }] }]} />
              <Animated.View style={[styles.ripple, { opacity: checkAnim.interpolate({ inputRange: [0.7, 1], outputRange: [0.4, 0] }), transform: [{ scale: checkAnim.interpolate({ inputRange: [0.7, 1], outputRange: [1, 1.8] }) }] }]} />
            </View>
            <Text style={styles.modalTitle}>Account Created!</Text>
            <Text style={styles.modalMessage}>Welcome, <Text style={styles.highlightText}>{fullName.split(' ')[0]}</Text>!</Text>
            <Text style={styles.modalSubtitle}>Your account has been successfully created.{"\n"}<Text style={styles.modalSubtext}>Sign in to continue your journey.</Text></Text>
            <TouchableOpacity style={styles.btnSignIn} onPress={handleSignInNow} activeOpacity={0.9}>
              <Text style={styles.btnSignInText}>Sign In Now</Text>
              <IconMat name="arrow-forward" size={20} color="#0F172A" style={styles.btnIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => { setShowSuccess(false); navigation.replace("Login"); }}>
              <Text style={styles.btnSecondaryText}>I'll sign in later</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
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
  input: { backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#334155", color: "#FFFFFF", height: 52, borderRadius: 26, paddingHorizontal: 20, fontSize: 16 },
  btnPrimary: { width: "100%", height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", backgroundColor: "#60A5FA", marginBottom: 12, shadowColor: "#60A5FA", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  btnPrimaryText: { color: "#0F172A", fontSize: 16, fontWeight: "600" },
  errorText: { color: "#F87171", fontSize: 14, textAlign: "center", marginBottom: 12, backgroundColor: "rgba(239, 68, 68, 0.1)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)" },
  footer: { alignItems: "center", marginTop: 32, marginBottom: 20 },
  footerText: { color: "#64748B", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  socialIcons: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 24 },
  socialButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  loginLink: { color: "#60A5FA", fontSize: 14, fontWeight: "600", marginTop: 16 },
  contentContainer: { paddingBottom: 20 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.95)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalContent: { backgroundColor: "#1E293B", borderRadius: 32, padding: 40, alignItems: "center", width: "100%", maxWidth: 420, borderWidth: 1, borderColor: "#334155", shadowColor: "#60A5FA", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 15 },
  iconContainer: { alignItems: "center", justifyContent: "center", marginBottom: 32, position: "relative", width: 120, height: 120 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(16, 185, 129, 0.15)", borderWidth: 3, borderColor: "#10B981", justifyContent: "center", alignItems: "center", position: "absolute" },
  checkmark: { alignItems: "center", justifyContent: "center" },
  ripple: { position: "absolute", width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "#10B981", opacity: 0.3 },
  modalTitle: { color: "#FFFFFF", fontSize: 32, fontWeight: "bold", marginBottom: 16, textAlign: "center", letterSpacing: 0.5 },
  modalMessage: { color: "#FFFFFF", fontSize: 18, textAlign: "center", lineHeight: 26, marginBottom: 12, fontWeight: "500" },
  highlightText: { color: "#60A5FA", fontWeight: "bold" },
  modalSubtitle: { color: "#94A3B8", fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 40 },
  modalSubtext: { color: "#64748B", fontSize: 14 },
  btnSignIn: { width: "100%", height: 56, borderRadius: 28, backgroundColor: "#60A5FA", justifyContent: "center", alignItems: "center", flexDirection: "row", shadowColor: "#60A5FA", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6, marginBottom: 16 },
  btnSignInText: { color: "#0F172A", fontSize: 17, fontWeight: "600" },
  btnIcon: { marginLeft: 8 },
  btnSecondary: { width: "100%", height: 52, borderRadius: 26, backgroundColor: "transparent", borderWidth: 1.5, borderColor: "#334155", justifyContent: "center", alignItems: "center" },
  btnSecondaryText: { color: "#94A3B8", fontSize: 15, fontWeight: "600" },
});
