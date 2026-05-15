import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, Dimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome as Icon, MaterialIcons as IconMat } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUpStep1: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Welcome">;
type Props = { navigation: NavigationProp };

export default function WelcomeScreen({ navigation }: Props) {
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

  return (
    <View style={styles.container}>
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

          {/* Title Section - FIXED */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>
              Together, let's turn{"\n"}your goals into progress.
            </Text>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Your all-in-one space for learning, organizing, and staying productive.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.btnPrimary} 
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.9}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.btnPrimaryText}>Sign in</Text>
                <IconMat name="arrow-forward" size={20} color="#0A0F1C" />
              </View>
              <View style={styles.buttonShine} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnSecondary} 
              onPress={() => navigation.navigate("SignUpStep1")}
              activeOpacity={0.9}
            >
              <Text style={styles.btnSecondaryText}>Create account</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
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
  container: { flex: 1, backgroundColor: '#050810' },
  background: { position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' },
  glowOrb: { position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, backgroundColor: '#3B82F6', opacity: 0.12, top: -150, right: -100 },
  gridPattern: { position: 'absolute', width: '100%', height: '100%', opacity: 0.02, backgroundColor: '#60A5FA' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 48 },
  content: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40, gap: 12 },
  logoImage: { width: 40, height: 40 },
  brandName: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: 1.5 },
  titleSection: { marginBottom: 24, alignItems: 'center' },
  mainTitle: { 
    color: '#FFFFFF', 
    fontSize: 36, 
    fontWeight: '900', 
    lineHeight: 44, 
    letterSpacing: -1, 
    textAlign: 'center',
    marginBottom: 0,
  },
  subtitle: { color: '#94A3B8', fontSize: 15, lineHeight: 24, textAlign: 'center', paddingHorizontal: 20, marginBottom: 48 },
  buttonContainer: { marginBottom: 32, gap: 16 },
  btnPrimary: { width: '100%', height: 58, borderRadius: 29, backgroundColor: '#60A5FA', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10, position: 'relative' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 2 },
  btnPrimaryText: { color: '#050810', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  buttonShine: { ...StyleSheet.absoluteFillObject, backgroundColor: '#93C5FD', opacity: 0.3 },
  btnSecondary: { width: '100%', height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  btnSecondaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  forgotPassword: { alignSelf: 'center', paddingVertical: 8 },
  forgotPasswordText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  dividerText: { color: '#64748B', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
});