import React from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const items = [
  { title: "Generate quiz questions", subtitle: "Create practice questions from notes or topics.", icon: "quiz", route: "AIQuiz" },
  { title: "Answer any questions", subtitle: "Ask StudySync AI for study help.", icon: "question-answer", route: "AIAnswer" },
  { title: "AI suggest", subtitle: "Recommend learning resources.", icon: "tips-and-updates", route: "AISuggest" },
  { title: "AI assist", subtitle: "Prioritize tasks and explain why.", icon: "auto-awesome", route: "AIAssist" },
  { title: "Remind me AI", subtitle: "Suggest a study schedule from tasks.", icon: "alarm", route: "AIRemind" },
];

export default function StudySyncScreen() {
  const navigation = useNavigation<any>();

  return (
    <ImageBackground source={require("../../../assets/dashboard_bg.png")} style={{ flex: 1 }} resizeMode="cover">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.subHeader}>StudySync AI</Text>
        </View>

        {items.map((item) => (
          <TouchableOpacity key={item.route} style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate(item.route)}>
            <View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 20, paddingTop: 55, paddingBottom: 110 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 14 },
  subHeader: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1A2535", borderRadius: 14, padding: 14, marginBottom: 10 },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginBottom: 3 },
  cardSubtitle: { color: "#FFFFFF", fontSize: 12, lineHeight: 16 },
});
