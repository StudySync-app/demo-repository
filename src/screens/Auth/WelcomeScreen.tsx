import React from "react";
import { Alert, Linking, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome as Icon } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";

// ADDED ForgotPassword HERE TO FIX THE ERROR
type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUpStep1: undefined;
  ForgotPassword: undefined; // <--- Added this
  MainTabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Welcome">;
type Props = { navigation: NavigationProp };

export default function WelcomeScreen({ navigation }: Props) {
  const handleSocialLogin = async (provider: "google" | "github" | "facebook") => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Could not start social sign in.");
      await Linking.openURL(data.url);
    } catch (error: any) {
      Alert.alert("Social sign in failed", error.message || "Try signing in with email and password.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require("../../../assets/studysync_logo.png")} 
          style={styles.logoImage} 
          resizeMode="contain"
        />
        <Text style={styles.logoText}>StudySync</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.mainTitle}>
          Together, let's turn{"\n"}
          <Text style={styles.highlight}>your goals into progress.</Text>
        </Text>
        
        <Text style={styles.subtitle}>
          Your all-in-one space for learning, organizing, and staying productive; designed to help you succeed{"\n"}
          from day one.
        </Text>

        <TouchableOpacity 
          style={[styles.btn, styles.btnPrimary]} 
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.9}
        >
          <Text style={styles.btnPrimaryText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.btnOutline]} 
          onPress={() => navigation.navigate("SignUpStep1")}
          activeOpacity={0.9}
        >
          <Text style={styles.btnOutlineText}>Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.linkText}>Forgot password</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sign in options</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin("google")}>
              <Icon name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin("github")}>
              <Icon name="github" size={24} color="#E5E7EB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin("facebook")}>
              <Icon name="facebook" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0F172A", // Dark blue-gray
    paddingHorizontal: 24, 
    paddingTop: 60 
  },
  header: { 
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 48 
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  logoText: { 
    color: "#FFFFFF", 
    fontSize: 24, 
    fontWeight: "bold",
    letterSpacing: 0.5 
  },
  mainTitle: { 
    color: "#FFFFFF", 
    fontSize: 38, 
    fontWeight: "bold", 
    lineHeight: 46, 
    marginBottom: 16 
  },
  highlight: {
    color: "#60A5FA", 
  },
  subtitle: { 
    color: "#94A3B8", 
    fontSize: 15, 
    lineHeight: 24, 
    marginBottom: 36 
  },
  btn: { 
    width: "100%", 
    height: 52, 
    borderRadius: 26, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 16 
  },
  btnPrimary: { 
    backgroundColor: "#60A5FA", 
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  btnPrimaryText: { 
    color: "#0F172A", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  btnOutline: { 
    backgroundColor: "transparent", 
    borderWidth: 1.5, 
    borderColor: "#334155" 
  },
  btnOutlineText: { 
    color: "#FFFFFF", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  linkButton: { 
    alignSelf: "center", 
    marginVertical: 14 
  },
  linkText: { 
    color: "#94A3B8", 
    fontSize: 14, 
    textDecorationLine: "none" 
  },
  footer: { 
    alignItems: "center", 
    marginTop: 32, 
    marginBottom: 24 
  },
  footerText: { 
    color: "#64748B", 
    fontSize: 13, 
    fontWeight: "600", 
    textTransform: "uppercase", 
    letterSpacing: 1, 
    marginBottom: 16 
  },
  socialIcons: { 
    flexDirection: "row", 
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
  contentContainer: { 
    paddingBottom: 20 
  }
});
