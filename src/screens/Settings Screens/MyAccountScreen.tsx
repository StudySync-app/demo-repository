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

export default function MyAccountScreen() {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert("Account error", error.message);
      }
      setUser(data.user ?? null);
      setLoading(false);
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

  return (
    <ImageBackground
      source={require("../../../assets/dashboard_bg.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.subHeader}>My account</Text>
        </View>

        <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate("PersonalDetails")}>
          <Text style={styles.cardTitle}>Personal details</Text>
          <Text style={styles.cardSubtitle}>{fullName} · {email}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate("Payments")}>
          <Text style={styles.cardTitle}>Payments & subscriptions</Text>
          <Text style={styles.cardSubtitle}>Review your current plan, update payment methods, and view invoices.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} activeOpacity={0.85} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={20} color="#FFFFFF" />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 14,
  },
  subHeader: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
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
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 0,
  },
  cardSubtitle: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 22,
  },
  detailLabel: {
    color: "#A3AED0",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
    textTransform: "uppercase",
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
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
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
