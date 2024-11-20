import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { Feather } from '@expo/vector-icons';

type UserSheetProps = {
  onClose: () => void;
};

export function UserSheet({ onClose }: UserSheetProps) {
  const options = [
    { icon: 'settings', label: 'Settings', onPress: () => {} },
    { icon: 'help-circle', label: 'Help', onPress: () => {} },
    { icon: 'log-out', label: 'Log out', onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
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