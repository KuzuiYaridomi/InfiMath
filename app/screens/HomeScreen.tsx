// app/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-paper-dropdown';
import { BlurView } from 'expo-blur';
import { IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const countryList = [
  { label: 'USA', value: 'usa' },
  { label: 'India', value: 'india' },
  { label: 'Spain', value: 'spain' },
];

const languageList = [
  { label: 'English', value: 'english' },
  { label: 'Hindi', value: 'hindi' },
  { label: 'Spanish', value: 'spanish' },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const checkPopupSeen = async () => {
      const seen = await AsyncStorage.getItem('popupSeen');
      if (!seen) {
        setShowPopup(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        if (savedLanguage) setSelectedLanguage(savedLanguage);
      }
    };
    checkPopupSeen();
  }, []);

  const handleConfirm = async () => {
    if (!selectedCountry || !selectedLanguage) {
      Alert.alert('Incomplete Selection', 'Please select both your country and language.');
      return;
    }
    await AsyncStorage.setItem('popupSeen', 'true');
    await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
    setShowPopup(false);
  };

  const handleResetPopup = async () => {
    await AsyncStorage.removeItem('popupSeen');
    setShowPopup(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['#00000090', '#00000090']}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.resetButton}>
            <IconButton
              icon="restore"
              size={24}
              iconColor="white"
              onPress={handleResetPopup}
            />
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.title}>Welcome to{"\n"}MathSolve</Text>
            <Text style={styles.subtitle}>
              Your personal AI problem solver and tutor ^_^
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('CameraScreen')}
            >
              <Text style={styles.buttonText}>❓ Ask Questions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('PracticeScreen')}
            >
              <Text style={styles.buttonText}>📦 Practice Questions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('HistoryScreen')}
            >
              <Text style={styles.buttonText}>🕒 Solving History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('SettingsScreen')}
            >
              <Text style={styles.buttonText}>⚙️ Adjust Settings</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showPopup && (
          <>
            <Animated.View style={[styles.blurContainer, { opacity: fadeAnim }]}>
              <BlurView style={styles.absolute} tint="light" intensity={12} />
            </Animated.View>

            <View style={styles.popup}>
              <Text style={styles.dropdownLabel}>🌐 Select Your Country</Text>
              <Dropdown
                label="Select Country"
                placeholder="Select Country"
                options={countryList}
                value={selectedCountry}
                onSelect={(value: string) => setSelectedCountry(value)}
                visible={showCountryDropdown}
                onDismiss={() => setShowCountryDropdown(false)}
                showDropDown={() => setShowCountryDropdown(true)}
              />

              <Text style={styles.dropdownLabel}>🈯 Select Language</Text>
              <Dropdown
                label="Select Language"
                placeholder="Select Language"
                options={languageList}
                value={selectedLanguage}
                onSelect={(value: string) => setSelectedLanguage(value)}
                visible={showLanguageDropdown}
                onDismiss={() => setShowLanguageDropdown(false)}
                showDropDown={() => setShowLanguageDropdown(true)}
              />

              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  resetButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderColor: '#00f2ff66',
    borderWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#121212',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#00ffff80',
    shadowColor: '#00ffff',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  popup: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    width: '85%',
    backgroundColor: '#1c1c1c',
    borderRadius: 15,
    padding: 20,
    zIndex: 9999,
  },
  dropdownLabel: {
    color: '#fff',
    marginBottom: 5,
    marginTop: 10,
    fontWeight: '600',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default HomeScreen;


