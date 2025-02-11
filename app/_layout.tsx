import { Slot, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter, useSegments } from 'expo-router';
import { getCurrentUser } from '@/app/src/db';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  
  const [fontsLoaded] = useFonts({
    'ClashDisplay': require('../assets/fonts/ClashDisplay-Regular.otf'),
  });

  useEffect(() => {
    async function init() {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (isAuthChecking) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/intro');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthChecking, isAuthenticated, segments]); 

  useEffect(() => {
    if (fontsLoaded && !isAuthChecking) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthChecking]);

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent'
        }
      }}
    >
      <Slot />
    </Stack>
  );
}
