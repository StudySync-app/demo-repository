import React, { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { User } from "@supabase/supabase-js";

import { supabase } from "../../lib/supabase";
import { useAppSettings } from "../../settings/AppSettingsContext";

export default function MyAccountScreen() {
  const navigation = useNavigation<any>();
  const { isLight, textScale } = useAppSettings();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert("Account error", error.message);
      }
      setUser(data.user ?? null);
    };

    loadUser();
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign out", "Do you want to sign out of StudySync?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert("Sign out failed", error.message);
            return;
          }

          const rootNavigation = navigation.getParent()?.getParent();
          rootNavigation?.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          );
        },
      },
    ]);
  };

  const fullName = user?.user_metadata?.full_name || "StudySync user";
  const email = user?.email || "No email loaded";

  const content = (
    <ScrollView style={[styles.container, isLight && styles.lightContainer]} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={isLight ? "#0F172A" : "#FFFFFF"} />
        </TouchableOpacity>
        <Text style={[styles.subHeader, isLight && styles.lightTitle, { fontSize: 22 * textScale }]}>My account</Text>
      </View>

      <TouchableOpacity style={[styles.card, isLight && styles.lightCard]} activeOpacity={0.85} onPress={() => navigation.navigate("PersonalDetails")}>
        <Text style={[styles.cardTitle, isLight && styles.lightTitle, { fontSize: 18 * textScale }]}>Personal details</Text>
        <Text style={[styles.cardSubtitle, isLight && styles.lightSubtitle, { fontSize: 12 * textScale }]}>{fullName} · {email}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, isLight && styles.lightCard]} activeOpacity={0.85} onPress={() => navigation.navigate("Payments")}>
        <Text style={[styles.cardTitle, isLight && styles.lightTitle, { fontSize: 18 * textScale }]}>Payments & subscriptions</Text>
        <Text style={[styles.cardSubtitle, isLight && styles.lightSubtitle, { fontSize: 12 * textScale }]}>Review your current plan, update payment methods, and view invoices.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} activeOpacity={0.85} onPress={handleSignOut}>
        <MaterialIcons name="logout" size={20} color="#FFFFFF" />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (isLight) {
    return <View style={styles.lightRoot}>{content}</View>;
  }

  return (
    <ImageBackground source={require("../../../assets/dashboard_bg.png")} style={{ flex: 1 }} resizeMode="cover">
      {content}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  lightRoot: { flex: 1, backgroundColor: "#F4F7FB" },
  lightContainer: { backgroundColor: "#F4F7FB" },
  content: { padding: 20, paddingTop: 55, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 14 },
  subHeader: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  card: {
    backgroundColor: "#1A2535",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
  lightCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE4F0" },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600", marginBottom: 0 },
  cardSubtitle: { color: "#FFFFFF", fontSize: 12, lineHeight: 22 },
  lightTitle: { color: "#0F172A" },
  lightSubtitle: { color: "#64748B" },
  signOutButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  signOutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
