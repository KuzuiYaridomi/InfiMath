// utils/asyncHelpers.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToStorage = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving to AsyncStorage:', e);
  }
};

export const getFromStorage = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value != null ? JSON.parse(value) : null;
  } catch (e) {
    console.error('Error reading from AsyncStorage:', e);
    return null;
  }
};

export const removeFromStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing from AsyncStorage:', e);
  }
};
