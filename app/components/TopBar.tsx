import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Skeleton } from './Skeleton';

export function TopBar() {
  const insets = useSafeAreaInsets();
  const { theme, colorScheme } = useTheme();
  const { user, loading } = useAuth();

  const firstName = useMemo(() => {
    if (!user) return 'Usuario';
    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const given = (meta?.given_name as string) || (meta?.full_name as string) || (meta?.name as string);
    const first = given ? String(given).trim().split(/\s+/)[0] : user.email?.split('@')[0];
    const name = first || 'Usuario';
    return name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : 'Usuario';
  }, [user]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <View style={[styles.leftSection]}>
       
        <Image
          source={
            colorScheme === 'dark'
              ? require('../../assets/images/cedi-logo-16.webp') // dark
              : require('../../assets/images/cedi-logo-12.webp') // light
          }
          style={styles.logo}
          contentFit="contain"
        />
        {loading ? (
          <Skeleton width={100} height={20} />
        ) : (
          <Text style={[styles.greeting, { color: theme.textMuted }]}>Hola,</Text>
        )}
        {!loading && (
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {firstName}
          </Text>
        )}
      </View>
      <View style={styles.iconsContainer}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface }]}
          onPress={() => router.push('/(tabs)/settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color={theme.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface }]}
          onPress={() => {
            if (!user) {
              router.push('/(tabs)/profile');
              return;
            }
            const meta = user.user_metadata as Record<string, unknown> | undefined;
            const given = (meta?.given_name as string) || (meta?.full_name as string) || (meta?.name as string) || '';
            const family = (meta?.family_name as string) || '';
            const fullName = `${given} ${family}`.trim();

            router.push({
              pathname: '/(tabs)/profile',
              params: {
                name: fullName || undefined,
                email: user.email ?? undefined,
              },
            });
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  leftSection: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  logo: {
    width: 36,
    height: 36,
  },
  greeting: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
  },
  name: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    flexShrink: 1,
  },
  iconsContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
