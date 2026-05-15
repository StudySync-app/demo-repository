import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Animated, Easing, Image, Dimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { MaterialIcons as IconMat } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get('window');

type RootStackParamList = { 
  VerifyCode: { email: string };
  ResetPassword: { email: string };
  ForgotPassword: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "VerifyCode">;
type RoutePropType = RouteProp<RootStackParamList, "VerifyCode">;
type Props = { navigation: NavigationProp; route: RoutePropType };

export default function VerifyCodeScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUpAnim, { toValue: 0, friction: 4, tension: 50, useNativeDriver: true }),
    ]).start();
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleVerifyCode = async () => {
    if (code.length !== 6) { Alert.alert("Error", "Please enter the 6-digit code"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.toLowerCase(), token: code, type: 'email' });
      if (error) throw error;
      navigation.navigate("ResetPassword", { email });
    } catch (err: any) { Alert.alert("Error", "Invalid code. Please try again."); } finally { setLoading(false); }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.toLowerCase() });
      if (error) throw error;
      Alert.alert("Success", "New code sent!");
      setCode("");
    } catch (err: any) { Alert.alert("Error", "Failed to resend."); } finally { setResendLoading(false); }
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
            <Text style={styles.mainTitle}>Verify Your Email</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code we sent to{'\n'}<Text style={styles.emailText}>{email}</Text></Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Verification Code</Text>
            <Animated.View style={[styles.codeWrapper, { borderColor: code.length > 0 ? '#60A5FA' : 'rgba(255,255,255,0.1)', backgroundColor: code.length > 0 ? 'rgba(96, 165, 250, 0.05)' : 'rgba(255,255,255,0.03)', shadowOpacity: code.length > 0 ? 0.3 : 0 }]}>
              <TextInput ref={inputRef} style={styles.codeInput} placeholder="000000" placeholderTextColor="#64748B" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} textAlign="center" autoCapitalize="none" />
            </Animated.View>
            <Text style={styles.codeHint}>Enter the 6 digits without spaces</Text>
          </View>
          <TouchableOpacity 
            style={[styles.primaryButton, (code.length !== 6 || loading) && styles.primaryButtonDisabled]}
            onPress={handleVerifyCode}
            activeOpacity={0.9}
            disabled={code.length !== 6 || loading}
          >
            {loading ? <ActivityIndicator color="#0A0F1C" /> : (
              <View style={styles.buttonContent}><Text style={styles.primaryButtonText}>Verify Code</Text><IconMat name="arrow-forward" size={20} color="#0A0F1C" /></View>
            )}
            <View style={styles.buttonShine} />
          </TouchableOpacity>
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={resendLoading} activeOpacity={0.8}><Text style={styles.resendLink}>{resendLoading ? "Sending..." : "Resend Code"}</Text></TouchableOpacity>
          </View>
          <View style={styles.backContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backLink}>← Back to login</Text></TouchableOpacity>
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
  emailText: { color: '#60A5FA', fontWeight: '600' },
  inputGroup: { marginBottom: 32 },
  inputLabel: { color: '#CBD5E1', fontSize: 13, fontWeight: '600', marginBottom: 10, marginLeft: 4, letterSpacing: 0.3, textAlign: 'center' },
  codeWrapper: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, height: 64, justifyContent: 'center', shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 0 }, shadowRadius: 20 },
  codeInput: { color: '#FFFFFF', fontSize: 24, fontWeight: '600', letterSpacing: 18, paddingVertical: 0 },
  codeHint: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 8 },
  primaryButton: { width: '100%', height: 58, borderRadius: 29, backgroundColor: '#60A5FA', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10, marginBottom: 20, position: 'relative' },
  primaryButtonDisabled: { opacity: 0.5 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 2 },
  primaryButtonText: { color: '#050810', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  buttonShine: { ...StyleSheet.absoluteFillObject, backgroundColor: '#93C5FD', opacity: 0.3 },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  resendText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  resendLink: { color: '#60A5FA', fontSize: 14, fontWeight: '700' },
  backContainer: { alignItems: 'center' },
  backLink: { color: '#64748B', fontSize: 14, fontWeight: '500' },
});