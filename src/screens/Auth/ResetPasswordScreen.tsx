import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Animated, Easing, Modal, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import IconMat from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";

type RootStackParamList = { 
  ResetPassword: { email: string };
  Login: undefined;
};

export default function ResetPasswordScreen({ navigation, route }: any) {
  const { email } = route.params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const handleResetPassword = async () => {
    setErrorMessage("");
    
    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      
      if (error) {
        setErrorMessage(error.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      await supabase.auth.signOut();

      // Show beautiful success modal
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.back(1.2),
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      setShowSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccess(false);
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <IconMat name="arrow-back" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different{"\n"}
            from previously used passwords.
          </Text>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <IconMat name="error-outline" size={20} color="#EF4444" style={styles.errorIcon} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <IconMat name="lock" size={22} color="#94A3B8" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="New Password" 
              placeholderTextColor="#64748B" 
              value={password} 
              onChangeText={(text) => { setPassword(text); setErrorMessage(""); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <IconMat name={showPassword ? "visibility-off" : "visibility"} size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <IconMat name="lock" size={22} color="#94A3B8" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Confirm Password" 
              placeholderTextColor="#64748B" 
              value={confirmPassword} 
              onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(""); }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <IconMat name={showConfirmPassword ? "visibility-off" : "visibility"} size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password must contain:</Text>
            <View style={styles.requirementItem}>
              <IconMat name={password.length >= 6 ? "check-circle" : "radio-button-unchecked"} size={16} color={password.length >= 6 ? "#10B981" : "#64748B"} />
              <Text style={[styles.requirementText, password.length >= 6 && styles.requirementMet]}>At least 6 characters</Text>
            </View>
            <View style={styles.requirementItem}>
              <IconMat name={password !== confirmPassword ? "radio-button-unchecked" : "check-circle"} size={16} color={password === confirmPassword && password.length > 0 ? "#10B981" : "#64748B"} />
              <Text style={[styles.requirementText, password === confirmPassword && password.length > 0 && styles.requirementMet]}>Passwords match</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.btnPrimary, (password.length < 6 || password !== confirmPassword || loading) && { opacity: 0.7 }]} 
            onPress={handleResetPassword}
            disabled={password.length < 6 || password !== confirmPassword || loading}
          >
            {loading ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnPrimaryText}>Reset Password</Text>}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* PROFESSIONAL SUCCESS MODAL */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            {/* Success Icon with Animated Ring */}
            <View style={styles.iconWrapper}>
              <View style={styles.successRing} />
              <View style={styles.successCircle}>
                <IconMat name="check" size={48} color="#10B981" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalSubtitle}>
              Your password has been updated successfully.
            </Text>

            <Text style={styles.modalMessage}>
              You can now log in with your new password.
            </Text>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleGoToLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText}>Continue to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
  
  // Error Styles
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(15, 23, 42, 0.6)", borderWidth: 1.5, borderColor: "#334155", borderRadius: 16, paddingHorizontal: 20, height: 56, marginBottom: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 16 },
  requirementsContainer: { backgroundColor: "rgba(15, 23, 42, 0.4)", borderRadius: 12, padding: 16, marginBottom: 24 },
  requirementsTitle: { color: "#94A3B8", fontSize: 13, fontWeight: "600", marginBottom: 12 },
  requirementItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  requirementText: { color: "#64748B", fontSize: 13, marginLeft: 10 },
  requirementMet: { color: "#10B981" },
  btnPrimary: { width: "100%", height: 52, borderRadius: 26, backgroundColor: "#60A5FA", justifyContent: "center", alignItems: "center", marginBottom: 16, shadowColor: "#60A5FA", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  btnPrimaryText: { color: "#0F172A", fontSize: 16, fontWeight: "600" },
  
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.2)",
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  successRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 3,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalSubtitle: {
    color: "#94A3B8",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  modalMessage: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  modalButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#60A5FA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  modalButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
});