import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../navigation/AppNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BackButton() {
    type BackNavProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation() as BackNavProp;
  const insets = useSafeAreaInsets();

  if (!navigation.canGoBack()) return null; // don't show on root tabs

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={[styles.btn, { top: insets.top + 8 }]}
      activeOpacity={0.8}
    >
      <Feather name="chevron-left" size={22} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    left: 16,           // <- top-right as you asked
    zIndex: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
});
