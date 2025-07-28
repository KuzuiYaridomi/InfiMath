import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput as RNTextInput,
  ToastAndroid,
  Alert,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { saveToStorage, getFromStorage } from "../../utils/asyncHelpers";
import { BlurView } from "expo-blur";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { CommonActions } from "@react-navigation/native";


const backgroundImage = require("../../assets/images/background.png");

const AnswerScreen = () => {
  const navigation = useNavigation() as NativeStackNavigationProp<RootStackParamList, 'AnswerScreen'>;
  const route = useRoute();

  const { questions } = route.params as { questions: { question: string; answer: string; explanation: string }[] };

  const [answers, setAnswers] = useState<string[]>(questions.map(() => ""));

  const normalize = (s: unknown) =>
  String(s ?? "")
    .replace(/\s+/g, "")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/⁵/g, "^5")
    .replace(/⁶/g, "^6")
    .replace(/⁷/g, "^7")
    .replace(/⁸/g, "^8")
    .replace(/⁹/g, "^9")
    .replace(/¹⁰/g, "^10")
    .toLowerCase();

const handleSubmit = async () => {
  console.log("🔥 handleSubmit() called");
  console.log("Current answers:", answers);

  if (answers.some((a) => !a.trim())) {
    Alert.alert("Incomplete", "Please answer all questions.");
    return;
  }

  if (!questions || questions.length === 0) {
    Alert.alert("No questions to submit.");
    return;
  }


  try {
    const checked = questions.map((item, index) => {
      const ua = answers[index].trim();
      const correct = normalize(ua) === normalize(item.answer);
      return {
        ...item,
        userAnswer: ua,
        explanation: correct ? "" : item.explanation,
        timestamp: Date.now(),
      };
    });

    console.log("🧠 Submitting answers:", checked);

    const existing = (await getFromStorage("practice_history")) || [];
    const updated = [...checked, ...existing];
    await saveToStorage("practice_history", updated);

    console.log("📦 Saved to storage. Navigating...");
    ToastAndroid.show("✅ Answers submitted", ToastAndroid.SHORT);
    console.log("✅ Toast shown. Dispatching navigation...");

    navigation.dispatch(
      CommonActions.navigate({
        name: "Tabs",
        params: {
          screen: "PracticeScreen",
          params: { justSubmitted: true },
        },
      })
    );
    console.log("🚀 Navigation dispatched");
  } catch (error) {
    console.error("❌ Submission failed:", error);
    Alert.alert("Error", "Something went wrong while submitting. Try again.");
  }
};



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={backgroundImage} style={styles.bg} resizeMode="cover">
        <ScrollView
           contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"   // 👈 ADD THIS
         >
          <Text style={styles.header}>Answer the Questions</Text>
          <BlurView intensity={70} tint="dark" style={styles.card} {...{ pointerEvents: "auto" }}>
            {questions.map((q, idx) => (
              <View key={idx} style={styles.qBlock}>
                <Text style={styles.qText}>Q{idx + 1}: {q.question}</Text>
                <RNTextInput
                  value={answers[idx]}
                  onChangeText={(t) => {
                    const updated = [...answers];
                    updated[idx] = t;
                    setAnswers(updated);
                  }}
                  placeholder="Your answer"
                  placeholderTextColor="#777"
                  style={styles.input}
                />
              </View>
            ))}

        <Button
            mode="contained"
             onPress={() => {
               console.log("🚨 Submit button PRESSED");
           handleSubmit();
          }}
              disabled={answers.some((a) => !a.trim())}
             style={{ marginTop: 12 }}
              >
           Submit Answers
        </Button>
          </BlurView>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(20,20,20,0.7)",
    borderColor: "#00f2ff40",
    borderWidth: 1,
  },
  qBlock: {
    marginBottom: 16,
  },
  qText: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
  },
});

export default AnswerScreen;

