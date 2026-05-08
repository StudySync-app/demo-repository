import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import IconMat from "react-native-vector-icons/MaterialIcons";

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

export default function SignUpStep2({ navigation, route }: any) {
  const { fullName, email } = route.params;
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
      <View style={styles.header}>
        <IconMat name="arrow-back" size={24} color="#94A3B8" onPress={() => navigation.goBack()} />
        <Text style={styles.logoText}>StudySync</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.mainTitle}>What describes you best?</Text>
        <Text style={styles.subtitle}>
          Choose your role so we can tailor your learning experience and sync progress accordingly.
        </Text>

        <View style={styles.btnGroup}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleBtn,
                selectedRole === role.id && styles.roleBtnActive,
              ]}
              onPress={() => setSelectedRole(role.id)}
              activeOpacity={0.9}
            >
              <Text style={[styles.roleBtnText, selectedRole === role.id && styles.roleBtnTextActive]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.btnPrimary,
            !selectedRole && styles.btnDisabled,
            loading && styles.btnLoading,
          ]}
          onPress={handleNext}
          disabled={!selectedRole || loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.btnPrimaryText}>Next Step</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Or sign up with</Text>
          <View style={styles.socialIcons}>
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
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0F172A", // Dark blue background matching other screens
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 40,
  },
  logoText: { 
    color: "#ffffff", 
    fontSize: 20, 
    fontWeight: "600", 
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  mainTitle: { 
    color: "#ffffff", 
    fontSize: 34, 
    fontWeight: "bold", 
    lineHeight: 42,
    marginBottom: 16,
  },
  subtitle: { 
    color: "#94A3B8", 
    fontSize: 15, 
    lineHeight: 22, 
    marginBottom: 36,
  },
  btnGroup: { 
    marginBottom: 24, 
    gap: 14,
  },
  roleBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#334155",
    backgroundColor: "#1E293B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleBtnActive: {
    borderColor: "#60A5FA",
    backgroundColor: "#1e3a8a",
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  roleBtnText: { 
    color: "#ffffff", 
    fontSize: 15, 
    fontWeight: "500",
  },
  roleBtnTextActive: { 
    color: "#ffffff", 
    fontWeight: "600",
    fontSize: 16,
  },
  btnPrimary: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#60A5FA",
    marginBottom: 12,
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
  btnDisabled: { opacity: 0.5 },
  btnLoading: { opacity: 0.8 },
  footer: { 
    alignItems: "center", 
    marginTop: 32, 
    marginBottom: 20,
  },
  footerText: { 
    color: "#64748B", 
    fontSize: 13, 
    marginBottom: 16,
    fontWeight: "600",
  },
  socialIcons: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 24,
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
  loginLink: { 
    color: "#60A5FA", 
    fontSize: 14, 
    fontWeight: "600", 
    marginTop: 16,
  },
  contentContainer: { 
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
});