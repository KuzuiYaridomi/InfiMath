// app/screens/PracticeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { TextInput, Button } from "react-native-paper";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
} from "../../utils/asyncHelpers";
import { generatePracticeQuestions } from "../../utils/MathSolverTwo";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { ToastAndroid } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

const PRACTICE_COUNT_KEY = "practice_query_count";
const PRACTICE_COOLDOWN_KEY = "practice_query_cooldown";
const PRACTICE_MAX_QUERIES = 5;
const PRACTICE_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const backgroundImage = require("../../assets/images/background.png");

interface GeneratedQnA {
  question: string;
  answer: string;
  explanation: string;
  userAnswer?: string;
}

const PracticeScreen = () => {
  const [question, setQuestion] = useState("");
  const [generatedQnAs, setGeneratedQnAs] = useState<GeneratedQnA[]>([]);
  const [grade, setGrade] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const navigation = useNavigation() as NativeStackNavigationProp<RootStackParamList, 'AnswerScreen'>;
  const route = useRoute();

  const gradeOptions = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "College"];
  const difficultyOptions = ["Easy", "Medium", "Hard"];

  useEffect(() => {
    const checkPrefs = async () => {
      const g = await getFromStorage("user_grade");
      const d = await getFromStorage("user_difficulty");
      if (!g || !d) setShowPreferences(true);
      else {
        setGrade(g);
        setDifficulty(d);
      }
    };
    checkPrefs();
  }, []);

  useFocusEffect(
  React.useCallback(() => {
    let isActive = true;

    const fetchLatest = async () => {
      const history = await getFromStorage("practice_history");

      if (isActive && Array.isArray(history) && history.length > 0) {
        const latestTs = Math.max(...history.map(h => h?.timestamp ?? 0));
        const latestSet = history.filter(h => (h?.timestamp ?? 0) === latestTs);
        setGeneratedQnAs(latestSet);
      } else if (isActive) {
        setGeneratedQnAs([]);
      }

      // toast only once
      // (route as any) so TS doesn't complain
      const params: any = (route as any).params;
      if (params?.justSubmitted) {
        ToastAndroid.show("✅ Answers submitted", ToastAndroid.SHORT);
        navigation.setParams?.({ justSubmitted: false } as any);
      }
    };

    fetchLatest();
    return () => {
      isActive = false;
    };
  }, [(route as any)?.params?.justSubmitted])
);


  const handleSavePreferences = async () => {
    if (!grade || !difficulty) {
      Alert.alert("Please select both grade and difficulty.");
      return;
    }
    await saveToStorage("user_grade", grade);
    await saveToStorage("user_difficulty", difficulty);
    setShowPreferences(false);
  };

  const handleGenerate = async () => {
    const now = Date.now();

    if (question.trim().toLowerCase() === "/genoff") {
      await saveToStorage("bypass_limit", true);
      Alert.alert("✅ Developer Bypass Enabled", "Query limit has been removed.");
      setQuestion("");
      return;
    }
    if (question.trim().toLowerCase() === "/genon") {
      await removeFromStorage("bypass_limit");
      Alert.alert("🚫 Bypass Disabled", "Query limit re-enabled.");
      setQuestion("");
      return;
    }

    const bypass = await getFromStorage("bypass_limit");
    const cooldownStart = await getFromStorage(PRACTICE_COOLDOWN_KEY);

    if (!bypass && cooldownStart && now - cooldownStart < PRACTICE_COOLDOWN_MS) {
      const minutesLeft = Math.ceil(
        (PRACTICE_COOLDOWN_MS - (now - cooldownStart)) / 60000
      );
      Alert.alert("Cooldown Active", `Please wait ${minutesLeft} min before trying again.`);
      return;
    }

    const storedCount = await getFromStorage(PRACTICE_COUNT_KEY);
    const count = typeof storedCount === "number" ? storedCount : 0;

    if (!bypass && count >= PRACTICE_MAX_QUERIES) {
      await saveToStorage(PRACTICE_COOLDOWN_KEY, now);
      Alert.alert("Limit Reached", "You’ve reached the max 5 questions. Please wait 2 hours.");
      return;
    }

    if (!question.trim()) return Alert.alert("Enter a prompt to generate questions.");

    const text: unknown = await generatePracticeQuestions(
      question,
      grade || "",
      difficulty || ""
    );

    let cleaned =
      typeof text === "string"
        ? text.trim()
        : typeof text === "object" && text !== null
        ? JSON.stringify(text).trim()
        : "";

    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```[a-z]*\n?/, "").replace(/```$/, "");
    }

    try {
      let parsed: any = JSON.parse(cleaned);

      if (!Array.isArray(parsed) && parsed.questions && Array.isArray(parsed.questions)) {
        parsed = parsed.questions;
      }

      if (!Array.isArray(parsed) || parsed.length !== 2) {
        throw new Error("No valid questions returned.");
      }

      const existing = (await getFromStorage("practice_questions")) || [];
      const updated = [
        ...parsed.map((q) => ({
          ...q,
          prompt: question,
          timestamp: Date.now(),
        })),
        ...existing,
      ];
      await saveToStorage("practice_questions", updated);

      navigation.navigate("AnswerScreen", { questions: parsed });
    } catch (err) {
      console.error("Failed to parse response:", cleaned);
      Alert.alert(
        "⚠ AI Error",
        "Gemini couldn't generate valid questions. Try rewording your topic."
      );
    }

    setQuestion("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
  <ImageBackground
    source={backgroundImage}
    style={styles.bg}
    resizeMode="cover"
  >
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
          <Text style={styles.header}>Practice a New Problem</Text>

          <BlurView intensity={50} tint="dark" style={styles.glass}>
            <View style={styles.inputRow}>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="Type the name of a topic to generate questions..."
                placeholderTextColor="#aaa"
                mode="outlined"
                style={[styles.textInput, { backgroundColor: "transparent" }]}
                right={<TextInput.Icon icon="send" onPress={handleGenerate} />}
              />
            </View>
          </BlurView>

          {!generatedQnAs.length ? null : (
            <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
              {generatedQnAs.map((item, idx) => (
                <View key={idx} style={styles.qBox}>
                  <Text style={styles.qText}>Q{idx + 1}: {item.question}</Text>
                  {item.userAnswer && item.userAnswer !== item.answer ? (
                    <>
                      <Text style={styles.aWrong}>❌ Your Answer: {item.userAnswer}</Text>
                      <Text style={styles.aCorrect}>✅ Correct: {item.answer}</Text>
                      <Text style={styles.expl}>🧠 {item.explanation}</Text>
                    </>
                  ) : item.userAnswer === item.answer ? (
                    <Text style={styles.aCorrect}>✅ Correct: {item.answer}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <Modal
          visible={showPreferences}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPreferences(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={70} tint="dark" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Set Your Preferences</Text>
              <Text style={styles.label}>Select Grade:</Text>
              {gradeOptions.map((g) => (
                <Button
                  key={g}
                  onPress={() => setGrade(g)}
                  mode={grade === g ? "contained" : "outlined"}
                  style={{ marginVertical: 4 }}
                >
                  {g}
                </Button>
              ))}
              <Text style={styles.label}>Select Difficulty:</Text>
              {difficultyOptions.map((d) => (
                <Button
                  key={d}
                  onPress={() => setDifficulty(d)}
                  mode={difficulty === d ? "contained" : "outlined"}
                  style={{ marginVertical: 4 }}
                >
                  {d}
                </Button>
              ))}
              <Button
                mode="contained"
                onPress={handleSavePreferences}
                style={{ marginTop: 16 }}
              >
                Save Preferences
              </Button>
            </BlurView>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 18,
    textAlign: "center",
  },
  glass: {
  backgroundColor: "#22222280",
  borderRadius: 20,
  padding: 16,
  borderColor: "#00f2ff40",
  borderWidth: 1,
  marginVertical: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  textInput: {
  flex: 1,
  borderRadius: 50,
  borderWidth: 1,
  borderColor: "#00f2ff40",
  color: "#fff",
  },
  qBox: {
    backgroundColor: "#ffffff10",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#00f2ff",
  },
  qText: { color: "#fff", fontWeight: "bold" },
  aWrong: { color: "#f88", marginTop: 4 },
  aCorrect: { color: "#8f8" },
  expl: { color: "#ccc", fontStyle: "italic", marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
  width: "90%",
  padding: 20,
  borderRadius: 20,
  backgroundColor: "#1e1e1e",
  borderColor: "#00f2ff50",
  borderWidth: 1,
  shadowColor: "#00f2ff",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
  },
  modalTitle: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#00f2ff",
  textAlign: "center",
  marginBottom: 16,
 },
  label: {
    color: "#ccc",
    marginTop: 10,
    marginBottom: 6,
    fontWeight: "600",
  },
  safeArea: {
  flex: 1,
  backgroundColor: "#095859", // or your preferred fallback background
 },
 scrollContainer: {
  flexGrow: 1,
  padding: 16,
  paddingBottom: 32, // ✅ fixes white gap at bottom
 },
});

export default PracticeScreen;




