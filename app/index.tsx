import { Text, View, FlatList, StyleSheet, RefreshControl } from "react-native";
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
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.id) return;
      
      const userMovements = await db.movements.list(currentUser.id);
      const sortedMovements = userMovements.sort((a, b) => {
        return new Date(b?.createdAt ?? 0).getTime() - 
               new Date(a?.createdAt ?? 0).getTime();
      });
      setMovements(sortedMovements.slice(0, 20));
    } catch (err) {
      // Handle error if needed
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (!fontsLoaded) return null;

  const renderMovement = ({ item }: { item: Movement }) => {
    const date = new Date(item.created_at || '');
    const formattedDate = date.toLocaleDateString('es-MX', { 
      day: '2-digit',
      month: 'short'
    }).toUpperCase();

    // Get status text in Spanish
    const getStatusText = (status: string) => {
      switch (status.toUpperCase()) {
        case 'REVERSED':
          return 'devuelta';
        case 'COMPLETED':
          return 'completada';
        default:
          return 'pendiente';
      }
    };

    // Get status color and icon based on status
    const getStatusColor = (status: string) => {
      switch (status.toUpperCase()) {
        case 'REVERSED':
          return colors.darkGray;
        case 'COMPLETED':
          return item.direction === 'INBOUND' ? '#22c55e' : colors.black;
        default:
          return colors.darkGray;
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status.toUpperCase()) {
        case 'REVERSED':
          return 'rotate-ccw';
        case 'COMPLETED':
          return item.direction === 'INBOUND' ? 'arrow-down-left' : 'arrow-up-right';
        default:
          return 'clock';
      }
    };

    return (
      <View style={styles.transaction}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Feather 
              name={getStatusIcon(item.status)} 
              size={24} 
              color={getStatusColor(item.status)}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {item.direction === 'INBOUND' ? 'Transferencia recibida' : 'Transferencia enviada'}
            </Text>
            <Text style={styles.date}>
              {formattedDate} • {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        <Text 
          style={[
            styles.amount, 
            { color: getStatusColor(item.status) }
          ]}
          numberOfLines={1}
        >
          {item.direction === 'OUTBOUND' ? '-' : ''}${Math.abs(item.final_amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <View key={index} style={styles.transaction}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Skeleton width={24} height={24} />
          </View>
          <View style={styles.transactionInfo}>
            <Skeleton width={200} height={16} />
            <Skeleton width={150} height={14} />
          </View>
        </View>
        <Skeleton width={80} height={16} />
      </View>
    ));
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.black}
          />
        }
        ListHeaderComponent={
          <View style={{ alignItems: 'center', width: '100%' }}>
            <Header />
            <BalanceCard />
            <Text style={[styles.title, { alignSelf: 'center' }]}>Transacciones recientes</Text>
          </View>
        }
        data={isLoading ? [] : movements}
        renderItem={renderMovement}
        ListEmptyComponent={isLoading ? renderSkeletons : null}
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
    paddingRight: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    width: '100%',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
    marginRight: 8,
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
    minWidth: 90,
    flexShrink: 0,
  }
});


