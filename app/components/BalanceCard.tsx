import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/app/src/db';
import { getBalance } from '@/app/services/core';
import { Skeleton } from './Skeleton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface BalanceCardProps {
  balance?: number;
  teamId?: string | null;
}

const HIDDEN_LABEL = '• • • • • • •';

export function BalanceCard({ balance: balanceProp, teamId }: BalanceCardProps) {
  const { theme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [teamBalance, setTeamBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    async function fetchUserBalance() {
      if (user?.id) {
        try {
          const bal = await getBalance(user.id);
          setUserBalance(bal ?? 0);
        } catch {
          setUserBalance(0);
        }
      }
    }
    fetchUserBalance();
  }, [user?.id]);

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
        }
        const bal = await getBalance(teamOwnerId);
        setTeamBalance(bal ?? 0);
      } catch {
        setTeamBalance(0);
      } finally {
        setLoading(false);
      }
    }
    fetchTeamBalance();
  }, [teamId]);

  const hasBalanceValue =
    typeof balanceProp === 'number' ||
    typeof teamBalance === 'number' ||
    typeof userBalance === 'number';

  const isLoading = authLoading || loading || !hasBalanceValue;
  const displayBalance = balanceProp ?? teamBalance ?? userBalance ?? 0;
  const formattedBalance = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayBalance);

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, marginTop: 15 }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Balance disponible</Text>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => setHidden((h) => !h)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={hidden ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={theme.textMuted}
          />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.amountRow}>
          <Skeleton width={160} height={40} />
        </View>
      ) : (
        <Text style={[styles.balance, { color: theme.text }]} numberOfLines={1}>
          {hidden ? HIDDEN_LABEL : `$${formattedBalance}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
  },
  eyeButton: {
    padding: 4,
  },
  amountRow: {
    alignItems: 'flex-start',
  },
  balance: {
    fontFamily: 'ClashDisplay',
    fontSize: 36,
    letterSpacing: -0.5,
  },
});
