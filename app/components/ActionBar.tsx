import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';

export function ActionBar() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tabButton}>
        <AntDesign name="home" size={24} color={colors.black} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerButton}>
        <View style={styles.plusButton}>
          <Ionicons name="add" size={32} color={colors.white} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabButton}>
        <Feather name="credit-card" size={24} color={colors.black} />
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