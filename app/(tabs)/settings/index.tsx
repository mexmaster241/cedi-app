import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/app/constants/colors';


export default function UserPage() {
  const options = [
    { icon: 'settings', label: 'Settings', onPress: () => {} },
    { icon: 'file-text', label: 'Estados de cuenta', onPress: () => {} },
    { icon: 'shield', label: 'Seguridad', onPress: () => {} },
    { icon: 'help-circle', label: 'Help', onPress: () => {} },
    { icon: 'log-out', label: 'Log out', onPress: () => {} },
  ];

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Ajustes</Text>
        </View>

        <View style={styles.content}>
          {options.map((option, index) => (
            <TouchableOpacity 
              key={option.label} 
              style={[
                styles.option,
                index !== options.length - 1 && styles.borderBottom
              ]}
              onPress={option.onPress}
            >
              <Feather name={option.icon as any} size={24} color={colors.black} />
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
    color: colors.black,
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  optionText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
  },
});