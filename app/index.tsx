import { Text, View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useFonts } from 'expo-font';
import React, { useCallback, useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { BalanceCard } from './components/BalanceCard';
import { ActionBar } from './components/ActionBar';
import { TopBar } from './components/TopBar';
import { QuickActions } from './components/QuickActions';
import { TransactionList } from './components/TransactionList';
import { db } from './src/db';
import { Skeleton } from './components/Skeleton';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

SplashScreen.preventAutoHideAsync();

export interface Movement {
  id: string;
  category: string;
  direction: string;
  status: string;
  final_amount: number;
  counterparty_name: string;
  concept?: string;
  created_at?: string;
  clave_rastreo: string;
}

export default function Index() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    ClashDisplay: require('../assets/fonts/ClashDisplay-Regular.otf'),
  });

  useEffect(() => {
    const fetchTeamInfo = async () => {
      if (user) {
        const memberships = await db.teams.getTeamMemberships(user.id);
        if (memberships && memberships.length > 0) {
          setTeamId(memberships[0].team_id);
        } else {
          setTeamId(null);
        }
      }
    };
    fetchTeamInfo();
  }, [user]);

  const fetchMovements = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userMovements = teamId
        ? await db.movements.teamList(teamId)
        : await db.movements.list(user.id);
      const sorted = (userMovements || []).sort(
        (a, b) => new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime()
      );
      setMovements(sorted.slice(0, 20));
    } catch (err) {
      console.error('Error fetching movements', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user, teamId]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMovements();
  }, [fetchMovements]);

  if (!fontsLoaded) return null;

  const renderSkeletons = () => (
    <>
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <View key={i} style={styles.skeletonRow}>
            <View style={styles.skeletonLeft}>
              <Skeleton width={44} height={44} />
              <View>
                <Skeleton width={180} height={16} />
                <View style={{ marginTop: 6 }}>
                  <Skeleton width={120} height={13} />
                </View>
              </View>
            </View>
            <Skeleton width={80} height={18} />
          </View>
        ))}
    </>
  );

  return (
    <View
      style={[styles.screen, { backgroundColor: theme.background }]}
      onLayout={onLayoutRootView}
    >
      <TopBar />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <BalanceCard teamId={teamId} />
          <QuickActions />
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Transacciones recientes
          </Text>
        </View>
        <TransactionList
          items={movements}
          isLoading={isLoading}
          renderSkeleton={renderSkeletons}
        />
      </ScrollView>
      <ActionBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    marginTop: 28,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  skeletonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
