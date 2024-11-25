import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useRouter, usePathname } from 'expo-router';

export function ActionBar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleHomePress = () => {
    if (pathname !== '/') {
      router.replace('/');
    }
  };

  const handleDepositPress = () => {
    router.push('/deposit');
  };

  const handleCardPress = () => {
    router.push('/card');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={handleHomePress}
      >
        <AntDesign 
          name="home" 
          size={24} 
          color={pathname === '/' ? colors.black : colors.lightGray} 
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerButton} onPress={handleDepositPress}>
        <View style={styles.plusButton}>
          <Ionicons name="add" size={32} color={colors.white} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabButton} onPress={handleCardPress}>
        <Feather 
          name="credit-card" 
          size={24} 
          color={colors.lightGray} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.beige,
  },
  tabButton: {
    padding: 8,
  },
  centerButton: {
    marginTop: -40, // Moves the button up to overlap the navbar
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});