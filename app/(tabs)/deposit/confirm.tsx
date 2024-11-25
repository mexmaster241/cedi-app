import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/app/constants/colors';
import { useState } from 'react';

export default function ConfirmDepositScreen() {
  const { amount, recipientName, accountNumber } = useLocalSearchParams<{
    amount: string;
    recipientName: string;
    accountNumber: string;
  }>();
  const [concept, setConcept] = useState('');

  const handleConfirm = () => {
    // Handle transaction confirmation
    console.log('Transaction confirmed:', {
      amount,
      recipientName,
      accountNumber,
      concept,
    });
  };

  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Confirmar depósito</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amount}>{amount}</Text>
          </View>

          <View style={styles.recipientCard}>
            <Text style={styles.label}>Destinatario</Text>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.accountNumber}>{accountNumber}</Text>
          </View>

          <View style={styles.conceptContainer}>
            <Text style={styles.label}>Concepto</Text>
            <TextInput
              style={styles.conceptInput}
              placeholder="Agregar concepto (opcional)"
              value={concept}
              onChangeText={setConcept}
              placeholderTextColor={colors.darkGray}
            />
          </View>

          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirmar depósito</Text>
          </TouchableOpacity>
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
    padding: 24,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  currencySymbol: {
    fontFamily: 'ClashDisplay',
    fontSize: 56,
    color: colors.black,
    marginRight: 8,
  },
  amount: {
    fontFamily: 'ClashDisplay',
    fontSize: 56,
    color: colors.black,
  },
  recipientCard: {
    backgroundColor: colors.beige,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  recipientName: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 16,
    color: colors.darkGray,
  },
  conceptContainer: {
    marginBottom: 32,
  },
  conceptInput: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
    paddingVertical: 8,
  },
  confirmButton: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto', // Pushes button to bottom
  },
  confirmButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
  },
});