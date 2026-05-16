import React, { useCallback, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getSetting, setSetting, type SettingKey } from "../../db/settings";
import { useAppSettings } from "../../settings/AppSettingsContext";

type AIItem = {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  settingKey: SettingKey;
};

const items: AIItem[] = [
  {
    title: "Generate quiz questions",
    subtitle: "Create practice questions from notes or topics.",
    icon: "quiz",
    route: "AIQuiz",
    settingKey: "aiQuizEnabled",
  },
  {
    title: "Answer any questions",
    subtitle: "Ask StudySync AI for study help.",
    icon: "question-answer",
    route: "AIAnswer",
    settingKey: "aiAnswerEnabled",
  },
  {
    title: "AI suggest",
    subtitle: "Recommend learning resources.",
    icon: "tips-and-updates",
    route: "AISuggest",
    settingKey: "aiSuggestEnabled",
  },
  {
    title: "AI assist",
    subtitle: "Prioritize tasks and explain why.",
    icon: "auto-awesome",
    route: "AIAssist",
    settingKey: "aiAssistEnabled",
  },
  {
    title: "Remind me AI",
    subtitle: "Suggest a study schedule from tasks.",
    icon: "alarm",
    route: "AIRemind",
    settingKey: "aiRemindEnabled",
  },
  {
    title: "AI note summarization",
    subtitle: "Enable clean summaries inside Notes.",
    icon: "summarize",
    route: "AISummary",
    settingKey: "aiSummarizeEnabled",
  },
];

function getInitialAISettings() {
  return items.reduce((settings, item) => {
    settings[item.settingKey] = getSetting(item.settingKey, false);
    return settings;
  }, {} as Record<SettingKey, boolean>);
}

export default function StudySyncScreen() {
  const navigation = useNavigation<any>();
  const { isLight, textScale } = useAppSettings();
  const [aiSettings, setAiSettings] = useState(getInitialAISettings);

  const updateAISetting = useCallback((key: SettingKey, value: boolean) => {
    setSetting(key, value);
    setAiSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const content = (
    <ScrollView
      style={[styles.container, isLight && styles.lightContainer]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={isLight ? "#0F172A" : "#FFFFFF"} />
        </TouchableOpacity>
        <Text style={[styles.subHeader, isLight && styles.lightTitle, { fontSize: 22 * textScale }]}>
          StudySync AI
        </Text>
      </View>

      {items.map((item) => {
        const enabled = !!aiSettings[item.settingKey];

        return (
          <TouchableOpacity
            key={item.settingKey}
            style={[styles.card, isLight && styles.lightCard]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={[styles.iconWrap, enabled && styles.iconWrapActive]}>
              <MaterialIcons name={item.icon as any} size={22} color="#FFFFFF" />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.cardTitle, isLight && styles.lightTitle, { fontSize: 17 * textScale }]}>
                {item.title}
              </Text>
              <Text style={[styles.cardSubtitle, isLight && styles.lightSubtitle, { fontSize: 12 * textScale }]}>
                {item.subtitle}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={(value) => updateAISetting(item.settingKey, value)}
              trackColor={{ false: "#475569", true: "#4B76E7" }}
              thumbColor="#FFFFFF"
            />
          </TouchableOpacity>
        );
      })}
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
  content: { padding: 20, paddingTop: 55, paddingBottom: 110 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 14 },
  subHeader: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  lightTitle: { color: "#0F172A" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1A2535",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  lightCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBE4F0",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: "#4B76E7" },
  textWrap: { flex: 1 },
  cardTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "700", marginBottom: 3 },
  cardSubtitle: { color: "#A3AED0", fontSize: 12, lineHeight: 16 },
  lightSubtitle: { color: "#64748B" },
});
