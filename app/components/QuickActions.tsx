import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

const ACTIONS: { key: string; label: string; icon: keyof typeof Feather.glyphMap; route: string }[] = [
  { key: 'enviar', label: 'Enviar', icon: 'send', route: '/(tabs)/pending' },
  { key: 'pagar', label: 'Pagar', icon: 'credit-card', route: '/(tabs)/pending' },
  { key: 'retirar', label: 'Retirar', icon: 'trending-down', route: '/(tabs)/deposit' },
  { key: 'qr', label: 'Ver QR', icon: 'maximize-2', route: '/(tabs)/card' },
];

export function QuickActions() {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Acciones rápidas</Text>
      <View style={styles.grid}>
        {ACTIONS.map(({ key, label, icon, route }) => (
          <TouchableOpacity
            key={key}
            style={[styles.action, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            onPress={() => router.push(route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
              <Feather name={icon} size={24} color={theme.icon} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.text }]} numberOfLines={1}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: 0,
    marginTop: 28,
  },
  sectionTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 17,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
  },
});
