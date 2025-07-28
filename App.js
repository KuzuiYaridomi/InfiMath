// App.js
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './context/ThemeContext';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// ← import the root view from gesture-handler:


function App() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  return (
    // ← wrap everything in GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      {showSplash ? (
        <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
          <Image
            source={require('./assets/images/InfiMathicon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      ) : (
        <SafeAreaProvider>
          <ThemeProvider>
            <PaperProvider>
              <AppNavigator />
            </PaperProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#088F8F',
  },
  logo: {
    width: 300,
    height: 300,
  },
});

export default registerRootComponent(App);
