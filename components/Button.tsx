// app/components/Button.tsx
import React, { useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  gradientColors?: string[];
  icon?: string; // e.g., "help-circle-outline"
  iconSize?: number;
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  gradientColors = ['#4c669f', '#3b5998', '#192f6a'],
  icon,
  iconSize = 24,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.inner}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={iconSize}
              color="white"
              style={styles.icon}
            />
          )}
          <Text style={styles.text}>{title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2b2b2b',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default Button;

