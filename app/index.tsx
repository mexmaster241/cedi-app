import { Text, View, ScrollView } from "react-native";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { colors } from './constants/colors';
import { BalanceCard } from './components/BalanceCard';
import { Transactions } from './components/Transactions';
import { ActionBar } from './components/ActionBar';
import { Header } from './components/Header';
import { TopBar } from './components/TopBar';
import { supabase } from './src/db';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [fontsLoaded] = useFonts({
    'ClashDisplay': require('../assets/fonts/ClashDisplay-Regular.otf'),
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.replace('/intro');
      }
    };

    checkUser();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.beige,
      }}
      onLayout={onLayoutRootView}
    >
      <TopBar />
      <ScrollView 
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: 24,
          paddingBottom: 100,
        }}
      >
        <Header />
        <BalanceCard />
        <Transactions />
      </ScrollView>
      <ActionBar />
    </View>
  );
}


