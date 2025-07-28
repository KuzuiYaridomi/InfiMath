import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { getFromStorage, saveToStorage } from "../../utils/asyncHelpers";
import { useTheme } from "../../context/ThemeContext";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground } from "react-native";
import { Alert, ToastAndroid, Platform, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
const backgroundImage = require("../../assets/images/background.png");


const CameraHistoryScreen = () => {
  const { mode } = useTheme();
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const stored = await getFromStorage("history");
      if (Array.isArray(stored)) {
        setEntries(stored);
      }
    };
    fetchHistory();
  }, []);

  const handleClearAll = () => {
  Alert.alert("Clear All History", "Are you sure you want to delete all entries?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        await saveToStorage("history", []); // or "practice_history"
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
            <Text style={styles.header}>📷 Questions You've Asked</Text>
            <Pressable onPress={handleClearAll}>
            <MaterialCommunityIcons name="trash-can-outline" size={26} color="#fff" />
           </Pressable>
          </View>
          {entries.map((entry, idx) => (
            <BlurView key={idx} intensity={60} tint={mode} style={styles.card}>
              {entry.text && <Text style={styles.qText}>Q: {entry.text}</Text>}
              {entry.answer && <Text style={styles.aText}>🧠 {entry.answer}</Text>}
              {Array.isArray(entry.images) &&
                entry.images.map((uri: string, i: number) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
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
    color: "#ccc",
    fontSize: 14,
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 8,
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

export default CameraHistoryScreen;
