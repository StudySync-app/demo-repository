import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Animated, Image, Dimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialIcons as IconMat } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get('window');

type RootStackParamList = { 
  ForgotPassword: undefined; 
  VerifyCode: { email: string };
  Login: undefined 
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;
type Props = { navigation: NavigationProp };

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUpAnim, { toValue: 0, friction: 4, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSendCode = async () => {
    if (!email.trim()) { Alert.alert("Error", "Please enter your email address"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) throw error;
      navigation.navigate("VerifyCode", { email: email.trim() });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send code.");
    } finally { setLoading(false); }
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
            <Text style={styles.mainTitle}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your email address and we'll send you a verification code to reset your password.</Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: focusedField === 'email' ? '#60A5FA' : 'rgba(255,255,255,0.1)', backgroundColor: focusedField === 'email' ? 'rgba(96, 165, 250, 0.05)' : 'rgba(255,255,255,0.03)', shadowOpacity: focusedField === 'email' ? 0.3 : 0 }]}>
                <View style={styles.inputIcon}><IconMat name="email" size={20} color={focusedField === 'email' ? '#60A5FA' : '#64748B'} /></View>
                <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#64748B" value={email} onChangeText={(text) => setEmail(text)} autoCapitalize="none" keyboardType="email-address" onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
              </Animated.View>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSendCode} activeOpacity={0.9} disabled={loading}>
              {loading ? <ActivityIndicator color="#0A0F1C" /> : (
                <View style={styles.buttonContent}><Text style={styles.primaryButtonText}>Send Code</Text><IconMat name="arrow-forward" size={20} color="#0A0F1C" /></View>
              )}
              <View style={styles.buttonShine} />
            </TouchableOpacity>
            <View style={styles.backContainer}><Text style={styles.backText}>Remember your password? </Text><TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backLink}>Sign In</Text></TouchableOpacity></View>
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
  inputIcon: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  input: { flex: 1, height: '100%', color: '#FFFFFF', fontSize: 16, fontWeight: '500', paddingVertical: 0 },
  primaryButton: { width: '100%', height: 58, borderRadius: 29, backgroundColor: '#60A5FA', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10, marginBottom: 20, position: 'relative' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 2 },
  primaryButtonText: { color: '#050810', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  buttonShine: { ...StyleSheet.absoluteFillObject, backgroundColor: '#93C5FD', opacity: 0.3 },
  backContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  backLink: { color: '#60A5FA', fontSize: 14, fontWeight: '700' },
});