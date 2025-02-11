import { colors } from '@/app/constants/colors';
import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/app/src/db';
import { db } from '@/app/src/db';
import { Skeleton } from './Skeleton';
import React from 'react';

export function BalanceCard() {
  const [balance, setBalance] = useState(0);
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
          setBalance(0);
          return;
        }
        
        setBalance(user.balance ?? 0);
      } catch (err) {
        console.error("Error fetching balance:", err);
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBalance();
  }, []);

  // Format the balance with commas and two decimal places
  const formattedBalance = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance);

  return (
    <View style={styles.card}>
      <Text style={[styles.label, { textAlign: 'center' }]}>Balance disponible</Text>
      {isLoading ? (
        <View style={{ alignItems: 'center' }}>
          <Skeleton width={200} height={38} />
        </View>
      ) : (
        <Text style={[styles.balance, { textAlign: 'center' }]}>${formattedBalance}</Text>
      )}
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
    textAlign: 'center',
  },
  balance: {
    fontFamily: 'ClashDisplay',
    fontSize: 32,
    color: colors.black,
    textAlign: 'center',
  },
});