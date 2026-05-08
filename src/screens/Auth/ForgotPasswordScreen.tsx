import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Animated, Easing } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import IconMat from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";

type RootStackParamList = { 
  ForgotPassword: undefined; 
  VerifyCode: { email: string };
  Login: undefined 
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      // THIS SENDS A 6-DIGIT CODE TO THE USER'S EMAIL
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });

      if (error) throw error;

      // Navigate to Verify Screen
      navigation.navigate("VerifyCode", { email: email.trim() });
      
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <IconMat name="arrow-back" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll{"\n"}
            send you a verification code.
          </Text>

          <View style={styles.inputContainer}>
            <IconMat name="email" size={22} color="#94A3B8" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Enter your email" 
              placeholderTextColor="#64748B" 
              value={email} 
              onChangeText={setEmail}
              autoCapitalize="none" 
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity 
            style={[styles.btnPrimary, loading && { opacity: 0.7 }]} 
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnPrimaryText}>Send Code</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.goBack()}>
            <Text style={styles.backToLoginText}>Remember your password? <Text style={styles.signInLink}>Sign In</Text></Text>
          </TouchableOpacity>
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
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(15, 23, 42, 0.6)", borderWidth: 1.5, borderColor: "#334155", borderRadius: 16, paddingHorizontal: 20, height: 56, marginBottom: 20 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 16 },
  btnPrimary: { width: "100%", height: 52, borderRadius: 26, backgroundColor: "#60A5FA", justifyContent: "center", alignItems: "center", marginBottom: 16, shadowColor: "#60A5FA", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  btnPrimaryText: { color: "#0F172A", fontSize: 16, fontWeight: "600" },
  backToLogin: { alignItems: "center", marginTop: 8 },
  backToLoginText: { color: "#94A3B8", fontSize: 14 },
  signInLink: { color: "#60A5FA", fontWeight: "600" },
});