import { colors } from '@/app/constants/colors';
import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '@/app/src/db';
import { Skeleton } from './Skeleton';
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface BalanceCardProps {
  balance?: number;
  teamId?: string | null;
}

export function BalanceCard({ balance: balanceProp, teamId }: BalanceCardProps) {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [teamBalance, setTeamBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        const data = await db.users.get(user.id);
        setUserData(data);
      }
    }
    fetchUserData();
  }, [user]);

  useEffect(() => {
    async function fetchTeamBalance() {
      if (!teamId) {
        setTeamBalance(null);
        return;
      }

      try {
        setLoading(true);
        const teamOwnerId = await db.teams.getIdOwner(teamId);
        if (!teamOwnerId) {
          setTeamBalance(0);
          return;
        };

        const ownerData = await db.users.get(teamOwnerId);
        setTeamBalance(ownerData?.balance || 0);
      } catch (error) {
        console.error('Error fetching team balance:', error);
        setTeamBalance(0);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamBalance();
  }, [teamId]);

  const isLoading = authLoading || loading;
  const displayBalance = balanceProp ?? teamBalance ?? userData?.balance ?? 0;

  const formattedBalance = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(displayBalance);

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