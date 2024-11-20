import { colors } from '@/app/constants/colors';
import { View, Text, StyleSheet } from 'react-native';


export function BalanceCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Balance disponible</Text>
      <Text style={styles.balance}>$1,234.56</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 8,
  },
  balance: {
    fontFamily: 'ClashDisplay',
    fontSize: 32,
    color: colors.black,
  },
});