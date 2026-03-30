import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as authService from '@/app/services/auth';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';

const ROUNDED = 16;

const SETTINGS_ITEMS: {
  key: string;
  label: string;
  description?: string;
  icon: keyof typeof Feather.glyphMap;
  dangerIcon?: boolean;
  onPress: () => void;
}[] = [
  {
    key: 'emergency-lock',
    label: 'Bloqueo de emergencia',
    description: 'Inhabilita tus productos inmediatamente',
    icon: 'lock',
    dangerIcon: true,
    onPress: () => {},
  },
  {
    key: 'request-card',
    label: 'Solicitar tarjeta física',
    icon: 'credit-card',
    onPress: () => {},
  },
  {
    key: 'activate-card',
    label: 'Activar tarjeta',
    description: 'Activa tu tarjeta física para usarla',
    icon: 'check-circle',
    onPress: () => {},
  },
  {
    key: 'legal',
    label: 'Legal',
    icon: 'file-text',
    onPress: () => {},
  },
  {
    key: 'report-bugs',
    label: 'Reporte de fallas en tu App',
    icon: 'phone',
    onPress: () => {},
  },
  {
    key: 'suggestions',
    label: 'Sugerencias de mejora',
    icon: 'mail',
    onPress: () => {},
  },
];

export default function SettingsScreen() {
  const { theme, colorScheme } = useTheme();
  const { refreshAuth } = useAuth();
  const lockIconColor = theme.error;

  const handleLogout = useCallback(() => {
    // En web, Alert.alert es un no-op; cerramos sesión directamente.
    if (Platform.OS === 'web') {
      (async () => {
        try {
          await authService.signOut();
          await refreshAuth();
          router.replace('/intro');
        } catch (error) {
          console.error('Error logging out:', error);
        }
      })();
      return;
    }

    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              await refreshAuth();
              router.replace('/intro');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  }, [refreshAuth]);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={24} color={theme.icon} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            Ajustes de la cuenta
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.listCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {SETTINGS_ITEMS.map((item, index) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.optionRow,
                  index < SETTINGS_ITEMS.length - 1 && [styles.optionBorder, { borderBottomColor: theme.border }],
                  pressed && { opacity: 0.7 },
                ]}
                android_ripple={undefined}
              >
                <Feather
                  name={item.icon}
                  size={22}
                  color={item.dangerIcon ? lockIconColor : theme.icon}
                />
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, { color: theme.text }]}>{item.label}</Text>
                  {item.description ? (
                    <Text style={[styles.optionDescription, { color: theme.textMuted }]} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <Feather name="chevron-right" size={20} color={theme.iconMuted} />
              </Pressable>
            ))}
          </View>

          <View style={styles.logoutSection}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutRow,
                { backgroundColor: theme.surface, borderColor: theme.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="log-out" size={22} color={theme.error} />
              <Text style={[styles.logoutLabel, { color: theme.error }]}>Cerrar sesión</Text>
              <Feather name="chevron-right" size={20} color={theme.iconMuted} />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
    minWidth: 44,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    minWidth: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  listCard: {
    borderRadius: ROUNDED,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  optionBorder: {
    borderBottomWidth: 1,
  },
  optionTextWrap: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  optionLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
  },
  optionDescription: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    marginTop: 2,
  },
  logoutSection: {
    marginTop: 28,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: ROUNDED,
    borderWidth: 1,
  },
  logoutLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    flex: 1,
    marginLeft: 14,
  },
});
