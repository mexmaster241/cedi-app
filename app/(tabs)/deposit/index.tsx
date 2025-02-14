import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/app/constants/colors';
import { getCurrentUser } from '@/app/src/db';
import { db } from '@/app/src/db';
import Toast from 'react-native-toast-message';
import React from 'react';

const COMMISSION_AMOUNT = 5.80; // Commission in pesos

export default function DepositScreen() {
  const [amount, setAmount] = useState('0');
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const currentUser = await getCurrentUser();
        const userEmail = currentUser?.email;
        
        if (!userEmail) {
          throw new Error('No email found for user');
        }

        // Get user ID first
        const userId = await db.users.getUserId(userEmail);
        if (!userId) {
          throw new Error('User ID not found');
        }

        // Then get full user data using ID
        const user = await db.users.get(userId);
        if (!user) {
          console.error("User not found");
          setUserBalance(0);
          return;
        }
        
        setUserBalance(user.balance ?? 0);
      } catch (err) {
        console.error("Error fetching balance:", err);
        setUserBalance(0);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBalance();
  }, []);

  const handleNumberPress = (num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else {
      setAmount(prev => prev + num);
    }
  };

  const handleDeletePress = () => {
    setAmount(prev => {
      if (prev.length === 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleContinue = () => {
    const numericAmount = parseFloat(amount) / 100;
    const totalAmount = numericAmount + COMMISSION_AMOUNT;

    if (totalAmount > userBalance) {
      Toast.show({
        type: 'error',
        text1: 'Saldo insuficiente',
        text2: `Broka ass`,
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    router.push({
      pathname: '/deposit/select-recipient',
      params: { 
        amount: numericAmount.toString(),
        commission: COMMISSION_AMOUNT.toString()
      }
    });
  };

  const formatAmount = (value: string) => {
    const number = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number / 100);
  };

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
          <Text style={styles.title}>Depositar</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amount}>{formatAmount(amount)}</Text>
          </View>

          <View style={styles.keypad}>
            {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', 'del']].map((row, i) => (
              <View key={i} style={styles.keypadRow}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.keypadButton}
                    onPress={() => key === 'del' ? handleDeletePress() : handleNumberPress(key)}
                  >
                    {key === 'del' ? (
                      <Feather name="delete" size={24} color={colors.black} />
                    ) : (
                      <Text style={styles.keypadButtonText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[
              styles.continueButton,
              amount === '0' && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={amount === '0'}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <Toast 
        config={{
          error: (props) => (
            <View style={toastStyles.container}>
              <View style={toastStyles.iconContainer}>
                <Feather name="alert-circle" size={24} color={colors.black} />
              </View>
              <View style={toastStyles.textContainer}>
                <Text style={toastStyles.title}>{props.text1}</Text>
                <Text style={toastStyles.message}>{props.text2}</Text>
              </View>
            </View>
          )
        }}
      />
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
    paddingBottom: 8,
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
    paddingTop: 80,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
  keypad: {
    flex: 0.8,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  keypadButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.beige,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 24,
    color: colors.black,
  },
  continueButton: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  continueButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
  },
});

const toastStyles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.beige,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 4,
  },
  message: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
  },
});