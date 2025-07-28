// app/screens/CameraScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Alert,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
} from "../../utils/asyncHelpers";
import { solveMathProblem } from "../../utils/MathSolver"; // ✅ Updated
import Animated, { useAnimatedStyle } from 'react-native-reanimated';


const backgroundImage = require("../../assets/images/background.png");

interface AnswerItem {
  question: string;
  answer: string;
}

const CameraScreen = () => {
  const [devBypass, setDevBypass] = useState(false);
  const { mode } = useTheme();
  const [question, setQuestion] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);


  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSubmit = async () => {
    const trimmed = question.trim();

    // Developer bypass
    if (trimmed === "/Query off") {
      setDevBypass(true);
      await saveToStorage("query_count", 0);
      await removeFromStorage("query_cooldown_start");
      Alert.alert("Developer Mode", "✅ Query limit bypass enabled.");
      setQuestion("");
      return;
    }
    if (trimmed === "/Query on") {
      setDevBypass(false);
      Alert.alert("Developer Mode", "🔒 Query limit re-enabled.");
      setQuestion("");
      return;
    }

    if (!trimmed && uploadedFiles.length === 0) {
      Alert.alert("Empty Input", "Please enter a question or upload an image.");
      return;
    }

    setIsTyping(true);
    scrollToEnd();

    const placeholder: AnswerItem = { question: trimmed || "(image)", answer: "Generating..." };
    setAnswers((prev) => [...prev, placeholder]);

    const response = await solveMathProblem(uploadedFiles, trimmed);
    setIsTyping(false);

    setAnswers((prev) =>
      prev.map((item, idx) =>
        idx === prev.length - 1
          ? { ...item, answer: response || "No response from solver." }
          : item
      )
    );

    const entryToSave = {
      text: trimmed,
      images: uploadedFiles,
      type: uploadedFiles.length > 0 ? (trimmed ? "both" : "image") : "text",
      answer: response,
      timestamp: Date.now(),
    };
    try {
      const existing = (await getFromStorage("history")) || [];
      const updated = [entryToSave, ...existing];
      await saveToStorage("history", updated);
    } catch (err) {
      console.error("Failed to save history:", err);
    }

    setQuestion("");
    setUploadedFiles([]);
  };

  const handlePickFile = async () => {
    if (uploadedFiles.length >= 3) {
      Alert.alert("Limit Reached", "You can only upload up to 3 images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setUploadedFiles([...uploadedFiles, result.assets[0].uri]);
    }
  };

  const handleOpenCamera = async () => {
    if (uploadedFiles.length >= 3) {
      Alert.alert("Limit Reached", "You can only upload up to 3 images.");
      return;
    }
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission Required", "Please allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setUploadedFiles([...uploadedFiles, result.assets[0].uri]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const renderAnswerItem = ({ item }: { item: AnswerItem }) => (
    <View style={styles.chatBubble}>
      <Text style={styles.questionText}>Q: {item.question}</Text>
      <Text style={styles.answerText}>A: {item.answer}</Text>
    </View>
  );

  return (
  <ImageBackground source={backgroundImage} style={styles.bg} resizeMode="cover">
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // adjust offset as needed
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={answers}
          renderItem={renderAnswerItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 160 }}
          onContentSizeChange={() => {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          }}
        />

        <View style={styles.glass}>
          <View style={styles.inputRow}>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Type your math problem..."
              placeholderTextColor="#aaa"
              mode="outlined"
              style={styles.textInput}
              right={<TextInput.Icon icon="send" onPress={handleSubmit} />}
              disabled={isTyping}
            />
            <IconButton icon="paperclip" size={26} onPress={handlePickFile} />
            <IconButton icon="camera" size={26} onPress={handleOpenCamera} />
          </View>

          <Text style={styles.note}>Uploaded: {uploadedFiles.length} / 3</Text>
          <View style={styles.previewRow}>
            {uploadedFiles.map((uri, i) => (
              <View key={i} style={styles.previewBox}>
                <Image source={{ uri }} style={styles.previewImage} />
                <IconButton
                  icon="close"
                  size={18}
                  onPress={() => removeFile(i)}
                  style={styles.removeBtn}
                />
              </View>
            ))}
          </View>

          {isTyping && (
            <View style={styles.typingContainer}>
              <ActivityIndicator animating size="small" />
              <Text style={styles.typingText}>Generating answer...</Text>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  </ImageBackground>
);

};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 40,
  },
  glass: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderColor: "#00f2ff50",
    borderWidth: 1,
    alignSelf: "stretch",
    marginTop: "auto",
    left: 12,
    right: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
  flex: 1,
  backgroundColor: "transparent",     // removes fill
  borderRadius: 50,                   // pill shape
  paddingHorizontal: 16,
  paddingVertical: 4,
  color: "#fff",                      // text color
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.4)", // subtle white border
},

  note: {
    color: "#aaa",
    marginTop: 8,
    fontSize: 12,
  },
  previewRow: {
    flexDirection: "row",
    marginTop: 12,
    flexWrap: "wrap",
    gap: 10,
  },
  previewBox: {
    position: "relative",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#222",
    zIndex: 2,
  },
  chatBubble: {
    backgroundColor: "#ffffff10",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#00f2ff",
  },
  questionText: {
    color: "#ddd",
    fontWeight: "600",
    marginBottom: 4,
  },
  answerText: {
    color: "#fff",
    fontSize: 14,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  typingText: {
    color: "#ccc",
  },
});

export default CameraScreen;


