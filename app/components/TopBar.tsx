import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export function TopBar() {
  const handleUserPress = () => {
    router.push('/settings');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.userButton}
        onPress={handleUserPress}
      >
        <Feather name="user" size={24} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  userButton: {
    padding: 8,
  },
});