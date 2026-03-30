import 'react-native-get-random-values'; // Polyfill for crypto.getRandomValues (gateway encryption)
import { Slot, Stack } from "expo-router";
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SecurityProvider } from './context/SecurityContext';
import { AuthProvider } from './context/AuthContext';
import { AuthRouter } from './components/AuthRouter';
import { ThemeProvider } from './context/ThemeContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'ClashDisplay': require('../assets/fonts/ClashDisplay-Regular.otf'),
    'FunnelDisplay-300': require('../assets/fonts/funnel-display-latin-300-normal.ttf'),
    'FunnelDisplay-400': require('../assets/fonts/funnel-display-latin-400-normal.ttf'),
    'FunnelDisplay-500': require('../assets/fonts/funnel-display-latin-500-normal.ttf'),
    'FunnelDisplay-600': require('../assets/fonts/funnel-display-latin-600-normal.ttf'),
    'FunnelDisplay-700': require('../assets/fonts/funnel-display-latin-700-normal.ttf'),
    'FunnelDisplay-800': require('../assets/fonts/funnel-display-latin-800-normal.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  return (
    <View style={styles.root} collapsable={false}>
      <SecurityProvider>
        <AuthProvider>
          <ThemeProvider>
            <AuthRouter />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            >
              <Slot />
            </Stack>
          </ThemeProvider>
        </AuthProvider>
      </SecurityProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
