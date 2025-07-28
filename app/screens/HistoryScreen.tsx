// app/screens/HistoryScreen.tsx
// ✅ File: HistoryScreen.tsx

import React, {  useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ImageBackground, Pressable, Animated } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { BlurView } from "expo-blur";

const backgroundImage = require("../../assets/images/background.png");

const HistoryScreen = () => {
  const { mode } = useTheme();
  const navigation = useNavigation();
  const scale1 = new Animated.Value(1);
  const scale2 = new Animated.Value(1);

  const handlePress = (target: string) => {
    navigation.navigate(target);
  };

  const animatePress = (scaleVar: Animated.Value, toValue: number) => {
    Animated.spring(scaleVar, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.bg} resizeMode="cover">
      <View style={styles.headerContainer}>
        <Text style={styles.header}>📚 History</Text>
        <Text style={styles.subtext}>Tap a button to view your question history</Text>

        <Animated.View style={{ transform: [{ scale: scale1 }] }}>
          <Pressable
            onPressIn={() => animatePress(scale1, 0.95)}
            onPressOut={() => animatePress(scale1, 1)}
            onPress={() => handlePress("CameraHistoryScreen")}
          >
            <BlurView intensity={70} tint={mode} style={styles.button}>
              <Text style={styles.buttonText}>📷 Questions You've Asked</Text>
            </BlurView>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: scale2 }] }}>
          <Pressable
            onPressIn={() => animatePress(scale2, 0.95)}
            onPressOut={() => animatePress(scale2, 1)}
            onPress={() => handlePress("PracticeHistoryScreen")}
          >
            <BlurView intensity={70} tint={mode} style={styles.button}>
              <Text style={styles.buttonText}>📝 Questions You Generated</Text>
            </BlurView>
          </Pressable>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  headerContainer: {
    paddingTop: 80,
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    borderColor: "#00f2ff50",
    borderWidth: 1,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HistoryScreen;


