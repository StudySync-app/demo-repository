import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Animated, Image, Dimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { MaterialIcons as IconMat, FontAwesome as Icon } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  SignUpStep1: undefined;
  SignUpStep2: { fullName: string; email: string };
  SignUpStep3: { fullName: string; email: string; role: string };
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SignUpStep2">;
type RoutePropType = RouteProp<RootStackParamList, "SignUpStep2">;

type Props = {
  navigation: NavigationProp;
  route: RoutePropType;
};

export default function SignUpStep2({ navigation, route }: Props) {
  const { fullName, email } = route.params;
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // Animations - Match WelcomeScreen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;

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

  const roles = [
    { id: "student", label: "I am a student" },
    { id: "teacher", label: "I am a teacher" },
    { id: "independent", label: "I am an independent learner" },
  ];

  const handleNext = () => {
    if (!selectedRole) return;
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("SignUpStep3", {
        fullName,
        email,
        role: selectedRole,
      });
    }, 400);
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
            <Text style={styles.mainTitle}>What describes you best?</Text>
            <Text style={styles.subtitle}>
              Choose your role so we can tailor your learning experience and sync progress accordingly.
            </Text>
          </View>

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleButton,
                  selectedRole === role.id && styles.roleButtonActive,
                ]}
                onPress={() => setSelectedRole(role.id)}
                activeOpacity={0.9}
              >
                <View style={styles.roleContent}>
                  <View style={[
                    styles.roleIndicator,
                    selectedRole === role.id && styles.roleIndicatorActive
                  ]} />
                  <Text style={[
                    styles.roleText,
                    selectedRole === role.id && styles.roleTextActive
                  ]}>
                    {role.label}
                  </Text>
                </View>
                {selectedRole === role.id && (
                  <IconMat name="check-circle" size={20} color="#60A5FA" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Next Button - Premium Style */}
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              !selectedRole && styles.primaryButtonDisabled
            ]}
            onPress={handleNext}
            activeOpacity={0.9}
            disabled={!selectedRole || loading}
          >
            {loading ? (
              <ActivityIndicator color="#0A0F1C" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>Next Step</Text>
                <IconMat name="arrow-forward" size={20} color="#0A0F1C" />
              </View>
            )}
            <View style={styles.buttonShine} />
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.signUpLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign Up */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Icon name="google" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Icon name="github" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Icon name="facebook" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
  // Role Selection
  roleContainer: {
    marginBottom: 32,
    gap: 14,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 18,
    height: 56,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },
  roleButtonActive: {
    borderColor: '#60A5FA',
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    shadowOpacity: 0.3,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  roleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleIndicatorActive: {
    borderColor: '#60A5FA',
    backgroundColor: '#60A5FA',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#FFFFFF',
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  signUpText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  signUpLink: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '700',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  // Social
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
});