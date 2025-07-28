// Project: React Native App with Expo and TypeScript
// this basically let pepes set their settings ofc..fhgfghdfgregfdasdwasd
// app/screens/SettingsScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Pressable,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { getFromStorage, saveToStorage } from '../../utils/asyncHelpers';

const backgroundImage = require('../../assets/images/background.png');

const gradeOptions = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'College'];
const difficultyOptions = ['Easy', 'Medium', 'Hard'];

const SettingsScreen = () => {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === 'dark';

  const [grade, setGrade] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [initialGrade, setInitialGrade] = useState<string | null>(null);
  const [initialDifficulty, setInitialDifficulty] = useState<string | null>(null);
  const [aboutVisible, setAboutVisible] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const toastAnim = useRef(new Animated.Value(-100)).current;

  const preferencesChanged = grade !== initialGrade || difficulty !== initialDifficulty;

  useEffect(() => {
    const loadPrefs = async () => {
      const g = await getFromStorage('user_grade');
      const d = await getFromStorage('user_difficulty');
      setGrade(g);
      setDifficulty(d);
      setInitialGrade(g);
      setInitialDifficulty(d);
    };
    loadPrefs();
  }, []);

  const handleSavePreferences = async () => {
    if (!grade || !difficulty) return;
    await saveToStorage('user_grade', grade);
    await saveToStorage('user_difficulty', difficulty);
    setInitialGrade(grade);
    setInitialDifficulty(difficulty);

    // Toast
    setShowToast(true);
    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowToast(false));
    }, 5000);
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Theme Toggle Card */}
          <BlurView intensity={60} tint="dark" style={styles.card}>
            <Text style={styles.label}>Toggle Theme</Text>
            <Pressable onPress={toggleTheme}>
              <Feather name={isDark ? 'sun' : 'moon'} size={28} color="#ffd369" />
            </Pressable>
          </BlurView>

          {/* Grade + Difficulty Card */}
          <BlurView intensity={60} tint="dark" style={styles.card}>
            <Text style={styles.label}>Select Grade</Text>
            {gradeOptions.map((g) => (
              <Button
                key={g}
                mode={grade === g ? 'contained' : 'outlined'}
                onPress={() => setGrade(g)}
                style={{ marginVertical: 4 }}
              >
                {g}
              </Button>
            ))}

            <Text style={[styles.label, { marginTop: 16 }]}>Select Difficulty</Text>
            {difficultyOptions.map((d) => (
              <Button
                key={d}
                mode={difficulty === d ? 'contained' : 'outlined'}
                onPress={() => setDifficulty(d)}
                style={{ marginVertical: 4 }}
              >
                {d}
              </Button>
            ))}
          </BlurView>

          {/* About Button */}
          <TouchableOpacity style={styles.aboutButton} onPress={() => setAboutVisible(true)}>
            <Text style={styles.aboutText}>About</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Save FAB */}
        {preferencesChanged && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSavePreferences}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        )}

        {/* Top-Right Slider Toast */}
        {showToast && (
          <Animated.View
            style={[
              styles.toast,
              {
                transform: [{ translateY: toastAnim }],
              },
            ]}
          >
            <Text style={styles.toastText}>Preferences saved</Text>
          </Animated.View>
        )}

        {/* About Overlay */}
        {aboutVisible && (
          <View style={styles.overlay}>
            <Pressable style={styles.closeIcon} onPress={() => setAboutVisible(false)}>
              <Feather name="x" size={28} color="#fff" />
            </Pressable>
            <ScrollView contentContainerStyle={styles.overlayContent}>
              <Text style={styles.overlayTitle}>About This App</Text>
              <Text style={styles.overlayText}>
                This app started as a contestant for the gemini competition hosted by Hack Club.
                I am a total beginner at making apps and it took me a while to get used to so many versatile tools and features.
                But thankfully through documentation and some external help, I was able to code the whole app by myself.
                Further features to be developed for the real launch of this app later.
                Hope this app comes off as a truly good tool to solve and learn how to do math or physics.
                Please message me at discord or slack: "kuzuiyaridomi"
                Thank you for using this app and I hope you enjoy it as much as I do!
                {"\n\n"}— Kuzui Yaridomi
              </Text>
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    borderColor: '#00f2ff30',
    borderWidth: 1,
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutButton: {
    marginTop: 20,
    backgroundColor: '#ffffff10',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderColor: '#00f2ff30',
    borderWidth: 1,
  },
  aboutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#00f2ff',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    shadowColor: '#00f2ff',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  saveText: {
    fontWeight: '700',
    color: '#000',
  },
  toast: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    zIndex: 100,
  },
  toastText: {
    color: '#fff',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 1000,
  },
  closeIcon: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 1001,
  },
  overlayContent: {
    padding: 30,
    paddingTop: 100,
  },
  overlayTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  overlayText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
});

export default SettingsScreen;

