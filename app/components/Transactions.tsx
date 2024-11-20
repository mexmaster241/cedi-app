import { View, Text, StyleSheet, FlatList } from 'react-native';

const mockTransactions = [
  { id: '1', title: 'Grocery Store', amount: -85.50, date: '2024-03-20' },
  { id: '2', title: 'Salary Deposit', amount: 2500.00, date: '2024-03-19' },
  { id: '3', title: 'Restaurant', amount: -45.80, date: '2024-03-18' },
];

export function Transactions() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transacciones recientes</Text>
      <FlatList
        data={mockTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <View>
              <Text style={styles.transactionTitle}>{item.title}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={[styles.amount, { color: item.amount > 0 ? '#22c55e' : '#ef4444' }]}>
              ${Math.abs(item.amount).toFixed(2)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
    marginBottom: 16,
    color: '#000000',
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  transactionTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: '#000000',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  amount: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
  },
});