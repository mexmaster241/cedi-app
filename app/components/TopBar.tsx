import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TopBar() {
  const insets = useSafeAreaInsets();
  
  const handleUserPress = () => {
    router.push('/settings');
  };

  return (
    <View style={[
      styles.container, 
      { paddingTop: insets.top }
    ]}>
      <View style={styles.rightContainer}>
        <TouchableOpacity 
          style={styles.userButton}
          onPress={handleUserPress}
        >
          <Feather name="user" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 'auto',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 16,
  },
  rightContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  userButton: {
    padding: 8,
  },
});