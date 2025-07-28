import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getFromStorage, saveToStorage } from "../../utils/asyncHelpers";
import { BlurView } from "expo-blur";
import { useTheme } from "../../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground } from "react-native";
import { Alert, ToastAndroid, Platform, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
const backgroundImage = require("../../assets/images/background.png");


const PracticeHistoryScreen = () => {
  const { mode } = useTheme();
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const stored = await getFromStorage("practice_history");
      if (Array.isArray(stored)) setEntries(stored);
    };
    load();
  }, []);

  const handleClearAll = () => {
  Alert.alert("Clear All History", "Are you sure you want to delete all entries?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        await saveToStorage("practice_history", []); // or "practice_history"
        setEntries([]);
        if (Platform.OS === "android") {
          ToastAndroid.show("All history cleared", ToastAndroid.SHORT);
        } else {
          // iOS fallback toast (if needed, can build custom)
          console.log("✅ All history cleared");
        }
      },
    },
   ]);
 };


  return (
    <ImageBackground source={backgroundImage} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
               <Text style={styles.header}>🧠 Practice Questions</Text>
               <Pressable onPress={handleClearAll}>
               <MaterialCommunityIcons name="trash-can-outline" size={26} color="#fff" />
               </Pressable>
          </View>

          {entries.map((item, idx) => (
            <BlurView key={idx} intensity={60} tint={mode} style={styles.card}>
              <Text style={styles.qText}>Q{idx + 1}: {item.question}</Text>
              <Text style={styles.aText}>✅ Answer: {item.answer}</Text>
              {item.userAnswer && item.userAnswer !== item.answer && (
                <>
                  <Text style={styles.wrongText}>❌ Your Answer: {item.userAnswer}</Text>
                  <Text style={styles.explText}>🧠 Explanation: {item.explanation}</Text>
                </>
              )}
            </BlurView>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "#00f2ff40",
    borderWidth: 1,
  },
  qText: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 6,
  },
  aText: {
    color: "#00ff88",
    marginBottom: 4,
  },
  wrongText: {
    color: "#ff6666",
  },
  explText: {
    color: "#ccc",
    fontStyle: "italic",
    marginTop: 4,
  },
  headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  marginTop: 50,
  marginBottom: 16,
},
});

export default PracticeHistoryScreen;
