import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, View, TouchableWithoutFeedback, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/app/src/db';
import { colors } from '../constants/colors';

interface SecurityContextType {
  isAppActive: boolean;
  lastActiveTimestamp: number;
  resetInactivityTimer: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isAppActive, setIsAppActive] = useState(true);
  const [lastActiveTimestamp, setLastActiveTimestamp] = useState(Date.now());
  const inactivityTimer = useRef<NodeJS.Timeout>();
  const lastAppState = useRef(AppState.currentState);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // Only consider the app inactive if it goes to background
    if (nextAppState === 'active' && lastAppState.current !== 'active') {
      setIsAppActive(true);
      // Reset the timer when coming back to foreground
      resetInactivityTimer();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      setIsAppActive(false);
    }
    
    lastAppState.current = nextAppState;
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    setLastActiveTimestamp(Date.now());
    inactivityTimer.current = setTimeout(async () => {
      // Only logout if the app is actually inactive
      if (!isAppActive) {
        await supabase.auth.signOut();
        router.replace('/login');
      }
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial setup of inactivity timer
    resetInactivityTimer();

    return () => {
      subscription.remove();
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  return (
    <SecurityContext.Provider value={{ isAppActive, lastActiveTimestamp, resetInactivityTimer }}>
      <TouchableWithoutFeedback onPress={resetInactivityTimer}>
        <View style={{ flex: 1 }}>
          {!isAppActive && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.beige,
                zIndex: 9999,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                source={require('../../assets/images/logo.png')}
                style={{
                  width: 800,
                  height: 268, // Maintaining aspect ratio
                  resizeMode: 'contain',
                }}
              />
    
            </View>
          )}
          {children}
        </View>
      </TouchableWithoutFeedback>
    </SecurityContext.Provider>
  );
}

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
}; 