import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Animated, Easing, Image, Dimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { FontAwesome as Icon, MaterialIcons as IconMat } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get('window');

type RootStackParamList = { 
  SignUpStep3: { fullName: string; email: string; role: string }; 
  MainTabs: undefined;
  Login: undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SignUpStep3">;
type RoutePropType = RouteProp<RootStackParamList, "SignUpStep3">;
type Props = { navigation: NavigationProp; route: RoutePropType };

export default function SignUpStep3({ navigation, route }: any) {
  const { fullName, email, role } = route.params;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;
  const modalFade = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUpAnim, { toValue: 0, friction: 4, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSignUp = async () => {
    setError(null);
    if (!password) { setError("Please enter a password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: { data: { full_name: fullName.trim(), role } },
      });

      if (signUpError) throw signUpError;
      if (!data?.user) throw new Error("Sign up failed.");

      setShowSuccess(true);
      Animated.parallel([
        Animated.timing(modalFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      ]).start();
      setTimeout(() => {
        Animated.spring(checkScale, { toValue: 1, friction: 3, tension: 60, useNativeDriver: true }).start();
      }, 200);
      
    } catch (err: any) {
      let msg = "Failed to create account.";
      if (err.message?.includes("User already registered")) msg = "Email already in use. Please sign in.";
      else if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInNow = () => {
    Animated.parallel([
      Animated.timing(modalFade, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
    ]).start(() => { 
      setShowSuccess(false); 
      navigation.replace("Login"); 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <View style={styles.glowOrb} />
        <View style={styles.gridPattern} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
          <View style={styles.header}>
            <Image source={require("../../../assets/StudySync_logo1.png")} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.brandName}>StudySync</Text>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Create your password</Text>
            <Text style={styles.subtitle}>Set a secure password to complete your account.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: focusedField === 'password' ? '#60A5FA' : 'rgba(255,255,255,0.1)', backgroundColor: focusedField === 'password' ? 'rgba(96, 165, 250, 0.05)' : 'rgba(255,255,255,0.03)', shadowOpacity: focusedField === 'password' ? 0.3 : 0 }]}>
                <TextInput style={styles.input} placeholder="Create a password" placeholderTextColor="#64748B" value={password} onChangeText={(text) => { setPassword(text); setError(null); }} secureTextEntry autoCapitalize="none" onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} />
              </Animated.View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: focusedField === 'confirm' ? '#60A5FA' : 'rgba(255,255,255,0.1)', backgroundColor: focusedField === 'confirm' ? 'rgba(96, 165, 250, 0.05)' : 'rgba(255,255,255,0.03)', shadowOpacity: focusedField === 'confirm' ? 0.3 : 0 }]}>
                <TextInput style={styles.input} placeholder="Confirm your password" placeholderTextColor="#64748B" value={confirm} onChangeText={(text) => { setConfirm(text); setError(null); }} secureTextEntry autoCapitalize="none" onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} />
              </Animated.View>
            </View>

            {error && (
              <Animated.View style={styles.errorContainer}>
                <IconMat name="error-outline" size={18} color="#F87171" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} activeOpacity={0.9} disabled={loading}>
              {loading ? <ActivityIndicator color="#0A0F1C" /> : (
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                  <IconMat name="arrow-forward" size={20} color="#0A0F1C" />
                </View>
              )}
              <View style={styles.buttonShine} />
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.signUpLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}><Icon name="google" size={22} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}><Icon name="github" size={22} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}><Icon name="facebook" size={22} color="#FFFFFF" /></TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <Modal transparent visible={showSuccess} animationType="none" onRequestClose={() => setShowSuccess(false)}>
        <Animated.View style={[styles.modalOverlay, { opacity: modalFade }]}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconGlow} />
              <Animated.View style={[styles.iconCircle, { transform: [{ scale: checkScale }] }]}>
                <IconMat name="check-circle" size={56} color="#10B981" />
              </Animated.View>
            </View>
            <Text style={styles.modalTitle}>Account Created!</Text>
            <Text style={styles.modalMessage}>Welcome, <Text style={styles.highlightText}>{fullName.split(' ')[0]}!</Text></Text>
            <Text style={styles.modalSubtitle}>Your account has been successfully created.{'\n'}<Text style={styles.modalSubtext}>Sign in to continue your journey.</Text></Text>
            
            <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleSignInNow} activeOpacity={0.9}>
              <View style={styles.buttonContent}>
                <Text style={styles.modalPrimaryButtonText}>Sign In Now</Text>
                <IconMat name="arrow-forward" size={20} color="#0A0F1C" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => { setShowSuccess(false); navigation.replace("Login"); }}>
              <Text style={styles.modalSecondaryButtonText}>I'll sign in later</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  background: { position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' },
  glowOrb: { position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, backgroundColor: '#3B82F6', opacity: 0.12, top: -150, right: -100 },
  gridPattern: { position: 'absolute', width: '100%', height: '100%', opacity: 0.02, backgroundColor: '#60A5FA' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 90, paddingBottom: 48 },
  content: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 56, gap: 12 },
  logoImage: { width: 40, height: 40 },
  brandName: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: 1.5, textShadowColor: 'rgba(59, 130, 246, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  titleSection: { marginBottom: 40, alignItems: 'center' },
  mainTitle: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', lineHeight: 42, letterSpacing: -1, marginBottom: 12, textAlign: 'center' },
  subtitle: { color: '#94A3B8', fontSize: 15, lineHeight: 24, textAlign: 'center', paddingHorizontal: 20 },
  form: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#CBD5E1', fontSize: 13, fontWeight: '600', marginBottom: 10, marginLeft: 4, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, height: 56, shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 0 }, shadowRadius: 20 },
  input: { flex: 1, height: '100%', color: '#FFFFFF', fontSize: 16, fontWeight: '500', paddingVertical: 0 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 14, marginBottom: 20, gap: 10 },
  errorText: { color: '#F87171', fontSize: 14, fontWeight: '500', flex: 1 },
  primaryButton: { width: '100%', height: 58, borderRadius: 29, backgroundColor: '#60A5FA', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10, marginBottom: 20, position: 'relative' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 2 },
  primaryButtonText: { color: '#050810', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  buttonShine: { ...StyleSheet.absoluteFillObject, backgroundColor: '#93C5FD', opacity: 0.3 },
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  signUpText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  signUpLink: { color: '#60A5FA', fontSize: 14, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  dividerText: { color: '#64748B', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(5, 8, 16, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 32, padding: 40, alignItems: 'center', width: '100%', maxWidth: 400, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 15 },
  iconWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 32, position: 'relative' },
  iconGlow: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#10B981', opacity: 0.2, shadowColor: '#10B981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 25, elevation: 10 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 3, borderColor: '#10B981', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  modalTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  modalMessage: { color: '#FFFFFF', fontSize: 17, textAlign: 'center', lineHeight: 24, marginBottom: 8, fontWeight: '500' },
  highlightText: { color: '#60A5FA', fontWeight: '700' },
  modalSubtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  modalSubtext: { color: '#64748B', fontSize: 13 },
  modalPrimaryButton: { width: '100%', height: 56, borderRadius: 28, backgroundColor: '#60A5FA', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8, marginBottom: 14, position: 'relative' },
  modalPrimaryButtonText: { color: '#050810', fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  modalSecondaryButton: { width: '100%', height: 52, borderRadius: 26, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center' },
  modalSecondaryButtonText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
});