import { Slot, Stack } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/app/src/db';
import { registerForPushNotificationsAsync, savePushToken, setupNotificationListeners } from './src/services/notifications';

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

  // Add state for push token
  const [expoPushToken, setExpoPushToken] = useState('');

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
          console.log('User authenticated:', session.user.id);
          setIsAuthenticated(true);
        } else {
          console.log('No session found');
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
        console.log('Auth state changed:', event);
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthChecking) return;

    const inAuthGroup = segments[0] === "(auth)";
    console.log('Current segment:', segments[0], 'inAuthGroup:', inAuthGroup, 'isAuthenticated:', isAuthenticated);

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

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token.data);
        savePushToken(token.data);
      }
    });

    // Setup notification listeners
    const unsubscribe = setupNotificationListeners(notification => {
      console.log('Notification received:', notification);
      // Handle notification in the foreground
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

