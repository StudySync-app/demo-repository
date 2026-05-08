import React from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Image, ImageBackground} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS, SPACING, RADIUS } from "../constants/theme";

type SettingsStackParamList = {
  SettingsMain: undefined;
  MyAccount: undefined;
  Personalization: undefined;
  Notifications: undefined;
  Security: undefined;
  StudySync: undefined;
};

type SettingsRouteName = keyof Omit<SettingsStackParamList, "SettingsMain">;

const settingsItems: Array<{
  title: string;
  icon: string;
  route: SettingsRouteName;
}> = [
  { title: "My account", icon: "person", route: "MyAccount" },
  { title: "Personalization", icon: "palette", route: "Personalization" },
  { title: "Notifications", icon: "notifications", route: "Notifications" },
  { title: "Security", icon: "security", route: "Security" },
  { title: "StudySync AI", icon: "psychology", route: "StudySync" }
];

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList, "SettingsMain">>();

  return (
  <ImageBackground
    source={require("../../assets/dashboard_bg.png")}
    style={{ flex: 1 }}
    resizeMode="cover"
  >
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
      <TouchableOpacity
        style={{ minWidth: 44 }}
        onPress={() => navigation.goBack()}
        hitSlop={12}
      >
        <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>

    <View style={styles.titleRow}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity hitSlop={12}>
        <MaterialIcons name="search" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
      
        <Image
          style={styles.heroGraphic}
          source={require("../../assets/settings_banner.jpg")}
         resizeMode="cover"
        />
     
      <View style={styles.settingsList}>
        {settingsItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.settingItem}
            activeOpacity={0.8}
            onPress={() => navigation.push(item.route)}
          >
            <View style={styles.settingIcon}>
              <Image
                source={
                  item.title === "My account"
                    ? require("../../assets/sett_account.png")
                    : item.title === "Personalization"
                    ? require("../../assets/sett_personalization.png")
                    : item.title === "Notifications"
                    ? require("../../assets/sett_notifications.png")
                    : item.title === "Security"
                    ? require("../../assets/sett_security.png")
                    : require("../../assets/sett_ai.png")
                }
                style={{
                  width: 22,
                  height: 22,
                  resizeMode: "contain",
                }}
              />
              </View>
            <Text style={styles.settingText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </ImageBackground>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent"
  },

  content: {
    padding: SPACING.screen,
    paddingTop: 55,
    paddingBottom: 40
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
},

titleRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
},

  arrowBack: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#0F172A"
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 4
  },

  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#0F172A"
  },

  heroCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 26,
    padding: 20,
    marginBottom: 24,
    minHeight: 160
  },

  heroText: {
    flex: 1,
    paddingRight: 16
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 4
  },

  heroGraphic: {
  width: '100%',        // This forces it to align with the buttons below
  height: 96,           // Reduced height so it's not "too large"
  borderRadius: 20,     // Matches the rounding of your buttons
  marginBottom: 24,     // Consistent spacing
  backgroundColor: "#111827",
  },

  settingsList: {
    marginTop: 2
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2535",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 8,
    minHeight: 48
  },

  settingIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  settingText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600"
  }
});