import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Animated, Easing } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import IconMat from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";

type RootStackParamList = { 
  VerifyCode: { email: string };
  ResetPassword: { email: string };
  ForgotPassword: undefined;
};

export default function VerifyCodeScreen({ navigation, route }: any) {
  const { email } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const inputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleVerifyCode = async () => {
    // ✅ CHANGED: Check for 8 digits
    if (code.length !== 8) {
      Alert.alert("Error", "Please enter the 8-digit code");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.toLowerCase(),
        token: code,
        type: 'email',
      });

      if (error) throw error;

      navigation.navigate("ResetPassword", { email });
    } catch (err: any) {
      Alert.alert("Error", "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.toLowerCase() });
      if (error) throw error;
      Alert.alert("Success", "New code sent!");
      setCode("");
    } catch (err: any) {
      Alert.alert("Error", "Failed to resend.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <IconMat name="arrow-back" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            Enter the 8-digit code we sent to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <View style={styles.codeContainer}>
            <TextInput
              ref={inputRef}
              style={styles.codeInput}
              placeholder="00000000"
              placeholderTextColor="#64748B"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={8}
              textAlign="center"
            />
          </View>

          {/* ✅ CHANGED: Check for 8 digits */}
          <TouchableOpacity 
            style={[styles.btnPrimary, (code.length !== 8 || loading) && { opacity: 0.7 }]} 
            onPress={handleVerifyCode}
            disabled={code.length !== 8 || loading}
          >
            {loading ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnPrimaryText}>Verify Code</Text>}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={resendLoading}>
              <Text style={styles.resendLink}>{resendLoading ? "Sending..." : "Resend Code"}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  content: { flex: 1 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(148, 163, 184, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 32 },
  title: { color: "#FFFFFF", fontSize: 32, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  subtitle: { color: "#94A3B8", fontSize: 16, lineHeight: 24, textAlign: "center", marginBottom: 32 },
  emailText: { color: "#60A5FA", fontWeight: "600" },
  codeContainer: { backgroundColor: "rgba(15, 23, 42, 0.6)", borderWidth: 1.5, borderColor: "#334155", borderRadius: 16, marginBottom: 20, height: 70, justifyContent: "center" },
  codeInput: { color: "#FFFFFF", fontSize: 32, fontWeight: "600", letterSpacing: 8 },
  btnPrimary: { width: "100%", height: 52, borderRadius: 26, backgroundColor: "#60A5FA", justifyContent: "center", alignItems: "center", marginBottom: 16, shadowColor: "#60A5FA", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  btnPrimaryText: { color: "#0F172A", fontSize: 16, fontWeight: "600" },
  resendContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
  resendText: { color: "#94A3B8", fontSize: 14 },
  resendLink: { color: "#60A5FA", fontSize: 14, fontWeight: "600" },
});