import { Slot, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/app/src/db';
import { SecurityProvider } from './context/SecurityContext';
import { registerForPushNotificationsAsync, savePushToken } from './src/services/notifications';
import { setupDepositNotifications } from './src/services/deposit-notifications';

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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setIsAuthenticated(false);
          return;
        }

        if (session?.user) {
          setIsAuthenticated(true);
          
          // Set up push notifications
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await savePushToken(token.data);
          }

          // Get user's CLABE
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('clabe')
            .eq('id', session.user.id)
            .single();

          if (!userError && userData?.clabe) {
            // Set up deposit notifications
            setupDepositNotifications(session.user.id, userData.clabe);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    }
    init();

    // Add auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          // Set up push notifications
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await savePushToken(token.data);
          }

          // Get user's CLABE
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('clabe')
            .eq('id', session.user.id)
            .single();

          if (!userError && userData?.clabe) {
            // Set up deposit notifications
            setupDepositNotifications(session.user.id, userData.clabe);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthChecking) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      console.log('Redirecting to login');
      router.replace('/intro');
    } else if (isAuthenticated && inAuthGroup) {
      console.log('Redirecting to home');
      router.replace('/');
    }
  }, [isAuthChecking, isAuthenticated, segments]);

  useEffect(() => {
    if (fontsLoaded && !isAuthChecking) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthChecking]);

  return (
    <SecurityProvider>
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
    </SecurityProvider>
  );
}

