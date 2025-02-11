import { Text, View, FlatList, StyleSheet } from "react-native";
import { useFonts } from 'expo-font';
import React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { colors } from './constants/colors';
import { BalanceCard } from './components/BalanceCard';
import { ActionBar } from './components/ActionBar';
import { Header } from './components/Header';
import { TopBar } from './components/TopBar';
import { getCurrentUser, db } from './src/db';
import { Skeleton } from './components/Skeleton';
import { Feather } from '@expo/vector-icons';

interface Movement {
  id: string;
  category: string;      
  direction: string;     
  status: string;        
  final_amount: number;
  counterparty_name: string;
  concept?: string;
  created_at?: string;
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    'ClashDisplay': require('../assets/fonts/ClashDisplay-Regular.otf'),
  });

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) return;
        
        const userMovements = await db.movements.list(currentUser.id);
        const sortedMovements = userMovements.sort((a, b) => {
          return new Date(b?.createdAt ?? 0).getTime() - 
                 new Date(a?.createdAt ?? 0).getTime();
        });
        setMovements(sortedMovements.slice(0, 20));
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching movements:', err);
        setIsLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const renderMovement = ({ item }: { item: Movement }) => {
    const date = new Date(item.created_at || '');
    const formattedDate = date.toLocaleDateString('es-MX', { 
      day: '2-digit',
      month: 'short'
    }).toUpperCase();

    return (
      <View style={styles.transaction}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Feather 
              name={item.direction === 'INBOUND' ? 'arrow-down-left' : 'arrow-up-right'} 
              size={24} 
              color={item.direction === 'INBOUND' ? '#22c55e' : colors.black}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>
              {item.direction === 'INBOUND' ? 'Transferencia recibida' : 'Transferencia enviada'}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
        <Text 
          style={[
            styles.amount, 
            { color: item.direction === 'INBOUND' ? '#22c55e' : colors.black }
          ]}
        >
          {item.direction === 'OUTBOUND' ? '-' : ''}${Math.abs(item.final_amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.beige,
      }}
      onLayout={onLayoutRootView}
    >
      <TopBar />
      <FlatList
        ListHeaderComponent={
          <View style={{ alignItems: 'center', width: '100%' }}>
            <Header />
            <BalanceCard />
            <Text style={[styles.title, { alignSelf: 'center' }]}>Transacciones recientes</Text>
          </View>
        }
        data={movements}
        renderItem={renderMovement}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      />
      <ActionBar />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
    color: colors.black,
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    width: '100%',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
  },
  date: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 2,
  },
  amount: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    textAlign: 'right',
    minWidth: 80,
  }
});


