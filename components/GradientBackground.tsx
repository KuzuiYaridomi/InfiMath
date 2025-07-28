// app/components/GradientBackground.tsx
import React from "react";
import { StyleSheet, ImageBackground, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

interface Props {
  children: React.ReactNode;
}

export default function GradientBackground({ children }: Props) {
  const { mode } = useTheme();

  const backgroundImage =
    mode === "dark"
      ? require("../assets/images/background.png")
      : require("../assets/images/background.png");

  // Explicitly define gradientColors as a tuple
  const gradientColors: [string, string, string] =
    mode === "dark"
      ? ["#0f2027", "#203a43", "#2c5364"]
      : ["#e0f7fa", "#b2ebf2", "#80deea"];

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});


