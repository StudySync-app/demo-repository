import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Animated, Easing, Modal, Image, Dimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { MaterialIcons as IconMat, MaterialCommunityIcons as IconMatCom } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get('window');

type RootStackParamList = { 
  ResetPassword: { email: string };
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ResetPassword">;
type RoutePropType = RouteProp<RootStackParamList, "ResetPassword">;
type Props = { navigation: NavigationProp; route: RoutePropType };

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Animations - Match WelcomeScreen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;
  
  // Success Modal Animations
  const modalFade = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
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

      // Show success modal with premium animations
      setShowSuccess(true);
      Animated.parallel([
        Animated.timing(modalFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      ]).start();
      setTimeout(() => {
        Animated.spring(checkScale, { toValue: 1, friction: 3, tension: 60, useNativeDriver: true }).start();
      }, 200);
      
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
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
      {/* Premium Background - Matches WelcomeScreen */}
      <View style={styles.background}>
        <View style={styles.glowOrb} />
        <View style={styles.gridPattern} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }]
            }
          ]}
        >
          {/* Header - Centered Logo */}
          <View style={styles.header}>
            <Image 
              source={require("../../../assets/StudySync_logo1.png")} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
            <Text style={styles.brandName}>StudySync</Text>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be different from previously used passwords.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Error Message */}
            {errorMessage && (
              <Animated.View style={styles.errorContainer}>
                <IconMat name="error-outline" size={18} color="#F87171" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </Animated.View>
            )}

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <Animated.View 
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: focusedField === 'password' ? '#60A5FA' : 'rgba(255,255,255,0.1)',
                    backgroundColor: focusedField === 'password' ? 'rgba(96, 165, 250, 0.05)' : 'rgba(255,255,255,0.03)',
                    shadowOpacity: focusedField === 'password' ? 0.3 : 0,
                  }
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Create a new password"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrorMessage(""); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <IconMatCom 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <Animated.View 
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: focusedField === 'confirm' ? '#60A5FA' : 'rgba(255,255,255,0.1)',
                    backgroundColor: focusedField === 'confirm' ? 'rgba(96, 165, 250, 0.05)' : 'rgba(255,255,255,0.03)',
                    shadowOpacity: focusedField === 'confirm' ? 0.3 : 0,
                  }
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your new password"
                  placeholderTextColor="#64748B"
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(""); }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <IconMatCom 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementItem}>
                <View style={[
                  styles.requirementDot,
                  password.length >= 6 && styles.requirementDotMet
                ]} />
                <Text style={[
                  styles.requirementText,
                  password.length >= 6 && styles.requirementTextMet
                ]}>At least 6 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <View style={[
                  styles.requirementDot,
                  password === confirmPassword && password.length > 0 && styles.requirementDotMet
                ]} />
                <Text style={[
                  styles.requirementText,
                  password === confirmPassword && password.length > 0 && styles.requirementTextMet
                ]}>Passwords match</Text>
              </View>
            </View>

            {/* Reset Button - Premium Style */}
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                (password.length < 6 || password !== confirmPassword || loading) && styles.primaryButtonDisabled
              ]}
              onPress={handleResetPassword}
              activeOpacity={0.9}
              disabled={password.length < 6 || password !== confirmPassword || loading}
            >
              {loading ? (
                <ActivityIndicator color="#0A0F1C" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>Reset Password</Text>
                  <IconMat name="arrow-forward" size={20} color="#0A0F1C" />
                </View>
              )}
              <View style={styles.buttonShine} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* ✅ SUCCESS MODAL - Premium Redesign */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="none"
        onRequestClose={() => setShowSuccess(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalFade }]}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
            
            {/* Animated Success Icon */}
            <View style={styles.iconWrapper}>
              <View style={styles.iconGlow} />
              <Animated.View style={[styles.iconCircle, { transform: [{ scale: checkScale }] }]}>
                <IconMat name="check-circle" size={56} color="#10B981" />
              </Animated.View>
            </View>

            {/* Success Message */}
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalSubtitle}>
              Your password has been updated successfully.
            </Text>
            <Text style={styles.modalMessage}>
              You can now log in with your new password.
            </Text>

            {/* Action Button */}
            <TouchableOpacity 
              style={styles.modalPrimaryButton}
              onPress={handleGoToLogin}
              activeOpacity={0.9}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.modalPrimaryButtonText}>Continue to Login</Text>
                <IconMat name="arrow-forward" size={20} color="#0A0F1C" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810', // MATCHES WelcomeScreen
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#3B82F6',
    opacity: 0.12,
    top: -150,
    right: -100,
  },
  gridPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.02,
    backgroundColor: '#60A5FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 90,
    paddingBottom: 48,
  },
  content: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 56,
    gap: 12,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  // Title
  titleSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
    letterSpacing: -1,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Form
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  // Requirements
  requirementsContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  requirementsTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 10,
  },
  requirementDotMet: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  requirementText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  requirementTextMet: {
    color: '#10B981',
    fontWeight: '600',
  },
  // Primary Button
  primaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
    position: 'relative',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 2,
  },
  primaryButtonText: {
    color: '#050810',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  buttonShine: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#93C5FD',
    opacity: 0.3,
  },
  // ✅ SUCCESS MODAL STYLES - Premium Redesign
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 16, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    opacity: 0.2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 3,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  modalMessage: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  modalPrimaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  modalPrimaryButtonText: {
    color: '#050810',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});