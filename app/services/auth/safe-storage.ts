/**
 * Web storage using AsyncStorage.
 * On native, safe-storage.native.ts (SecureStore) is used instead.
 * expo-secure-store fails on web with getValueWithKeyAsync is not a function.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function getItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function deleteItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
