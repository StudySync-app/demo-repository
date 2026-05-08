import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Animated, Easing, Image } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";
import IconMat from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../../lib/supabase";

type RootStackParamList = { Login: undefined; MainTabs: undefined; SignUpStep1: undefined; ForgotPassword: undefined };
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;
type Props = { navigation: NavigationProp };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animation
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  // LOGIN FUNCTION
  const handleLogin = async () => {
    setError(null); // Clear previous errors
    
    // 1. Check if fields are empty
    if (!email.trim() || !password) { 
      setError("Please enter your email and password.");
      return; 
    }
    
    setLoading(true);
    try {
      // 2. Call Supabase
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (loginError) throw loginError;
      if (!data?.user) throw new Error("Login failed.");

      // 3. Success -> Go to Main App
      navigation.replace("MainTabs");
    } catch (err: any) {
      // 4. Failure -> Show custom error
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }]
            }
          ]}
        >
          {/* 1. LOGO AND HEADER */}
          <View style={styles.header}>
            <Image 
              source={require("../../../assets/studysync_logo.png")} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
            <Text style={styles.appName}>StudySync</Text>
          </View>

          {/* 2. TITLE AND SUBTITLE */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>
              Together, let's turn{"\n"}
              <Text style={styles.highlight}>your goals into progress.</Text>
            </Text>
            {/* UPDATED SUBTITLE TO MATCH DESIGN */}
            <Text style={styles.subtitle}>
              Your personal space for learning and productivity.{"\n"}
              Log in to continue your journey.
            </Text>
          </View>

          {/* 3. INPUT FIELDS (Email & Password) */}
          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              placeholderTextColor="#64748B" 
              value={email} 
              onChangeText={(text) => { setEmail(text); setError(null); }} 
              autoCapitalize="none" 
              keyboardType="email-address"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#64748B" 
              value={password} 
              onChangeText={(text) => { setPassword(text); setError(null); }} 
              secureTextEntry
            />
          </View>

          {/* 4. CUSTOM ERROR BANNER */}
          {error && (
            <View style={styles.errorContainer}>
              <IconMat name="error-outline" size={20} color="#EF4444" style={styles.errorIcon} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 5. ACTION BUTTONS */}
          <View style={styles.buttonGroup}>
            {/* Sign In Button */}
            <TouchableOpacity 
              style={styles.btnPrimary} 
              onPress={handleLogin} 
              activeOpacity={0.9}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.btnPrimaryText}>Sign in</Text>
              )}
            </TouchableOpacity>
            
            {/* Sign Up Button */}
            <TouchableOpacity 
              style={styles.btnSecondary} 
              onPress={() => navigation.navigate("SignUpStep1")}
              activeOpacity={0.9}
            >
              <Text style={styles.btnSecondaryText}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* 6. FORGOT PASSWORD */}
          <TouchableOpacity 
            style={styles.forgotPassword} 
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* 7. SOCIAL LOGIN OPTIONS */}
          <Text style={styles.signInOptionsText}>Sign in options</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Icon name="google" size={28} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Icon name="github" size={28} color="#E5E7EB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Icon name="facebook" size={28} color="#3B82F6" />
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// STYLES MATCHING YOUR DESIGN
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0F172A", // <--- THIS FIXES THE BLACK BACKGROUND
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  logoImage: {
    width: 45,
    height: 45,
    marginRight: 12,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  titleSection: {
    marginBottom: 30,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "bold",
    lineHeight: 46,
    marginBottom: 16,
  },
  highlight: {
    color: "#60A5FA", 
  },
  subtitle: {
    color: "#94A3B8", 
    fontSize: 15,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 16, 
    gap: 24, // SPACING BETWEEN EMAIL AND PASSWORD
  },
  input: {
    backgroundColor: "#1E293B",
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    color: "#FFFFFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  
  // CUSTOM ERROR STYLES
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

  buttonGroup: {
    marginBottom: 24,
    gap: 16,
  },
  btnPrimary: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#60A5FA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  btnPrimaryText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
  },
  btnSecondary: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    alignItems: "center",
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  signInOptionsText: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
});