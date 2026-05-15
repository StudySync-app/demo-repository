import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Animated, Image, Alert, Linking, Dimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome as Icon, MaterialIcons as IconMat, MaterialCommunityIcons as IconMatCom } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get('window');

type RootStackParamList = { Login: undefined; MainTabs: undefined; SignUpStep1: undefined; ForgotPassword: undefined };
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;
type Props = { navigation: NavigationProp };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUpAnim, { toValue: 0, friction: 4, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password });
      if (loginError) throw loginError;
      if (!data?.user) throw new Error("Login failed.");
      navigation.replace("MainTabs");
    } catch (err: any) { setError(err.message || "Invalid email or password."); } finally { setLoading(false); }
  };

  const handleGitHubLogin = async () => {
    try {
      setError(null); setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: 'https://irnvninsapohyjweutse.supabase.co/auth/v1/callback' } });
      if (error) throw error;
      if (data?.url) await Linking.openURL(data.url);
    } catch (err: any) { Alert.alert('GitHub Login Error', err.message || 'Failed to login with GitHub'); } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null); setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://irnvninsapohyjweutse.supabase.co/auth/v1/callback' } });
      if (error) throw error;
      if (data?.url) await Linking.openURL(data.url);
    } catch (err: any) { Alert.alert('Google Login Error', err.message || 'Failed to login with Google'); } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.background}><View style={styles.glowOrb} /><View style={styles.gridPattern} /></View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
          <View style={styles.header}>
            <Image source={require("../../../assets/StudySync_logo1.png")} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.brandName}>StudySync</Text>
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey toward success</Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: focusedField === 'email' ? '#60A5FA' : 'rgba(255,255,255,0.1)', backgroundColor: focusedField === 'email' ? 'rgba(96, 165, 250, 0.05)' : 'rgba(255,255,255,0.03)', shadowOpacity: focusedField === 'email' ? 0.3 : 0 }]}>
                <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#64748B" value={email} onChangeText={(text) => { setEmail(text); setError(null); }} autoCapitalize="none" keyboardType="email-address" onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
              </Animated.View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: focusedField === 'password' ? '#60A5FA' : 'rgba(255,255,255,0.1)', backgroundColor: focusedField === 'password' ? 'rgba(96, 165, 250, 0.05)' : 'rgba(255,255,255,0.03)', shadowOpacity: focusedField === 'password' ? 0.3 : 0 }]}>
                <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#64748B" value={password} onChangeText={(text) => { setPassword(text); setError(null); }} secureTextEntry={!showPassword} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.7}><IconMatCom name={showPassword ? "eye-off" : "eye"} size={20} color="#64748B" /></TouchableOpacity>
              </Animated.View>
            </View>
            {error && (
              <Animated.View style={styles.errorContainer}>
                <IconMat name="error-outline" size={18} color="#F87171" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}
            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.9} disabled={loading}>
              {loading ? <ActivityIndicator color="#0A0F1C" /> : (
                <View style={styles.buttonContent}><Text style={styles.primaryButtonText}>Sign in</Text><IconMat name="arrow-forward" size={20} color="#0A0F1C" /></View>
              )}
              <View style={styles.buttonShine} />
            </TouchableOpacity>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUpStep1")}><Text style={styles.signUpLink}>Create account</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider}>
            <View style={styles.dividerLine} /><Text style={styles.dividerText}>or continue with</Text><View style={styles.dividerLine} />
          </View>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} activeOpacity={0.8}><Icon name="google" size={22} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={handleGitHubLogin} activeOpacity={0.8}><Icon name="github" size={22} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}><Icon name="facebook" size={22} color="#FFFFFF" /></TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
  eyeIcon: { padding: 4, marginLeft: 8 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24, paddingVertical: 8 },
  forgotPasswordText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
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
});