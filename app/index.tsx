import { Text, View, ScrollView } from "react-native";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { colors } from './constants/colors';
import { BalanceCard } from './components/BalanceCard';
import { Transactions } from './components/Transactions';
import { ActionBar } from './components/ActionBar';


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [fontsLoaded] = useFonts({
    'ClashDisplay': require('../assets/fonts/ClashDisplay-Regular.otf'),
  });

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
      <ScrollView 
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: 60,
          paddingBottom: 100,
        }}
      >
     
        <BalanceCard />
        <Transactions />
      </ScrollView>
      <ActionBar />
    </View>
  );
}

