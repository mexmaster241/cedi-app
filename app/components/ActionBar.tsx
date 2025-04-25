import React, { useRef, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useRouter, usePathname } from 'expo-router';
import { colors } from '../constants/colors';
import { useState, useEffect } from 'react';
import { getCurrentUser, db } from '../src/db';
import Toast from 'react-native-toast-message';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export function ActionBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  
  // Bottom sheet reference
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    async function checkMfaStatus() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) return;
        
        const userData = await db.users.get(currentUser.id);
        setMfaEnabled(userData?.mfa_enabled ?? false);
      } catch (err) {
        console.error("Error checking MFA status:", err);
      }
    }
    checkMfaStatus();
  }, []);

  const handleHomePress = () => {
    if (pathname !== '/') {
      router.replace('/');
    }
  };

  const handleDepositPress = () => {
    if (!mfaEnabled) {
      Toast.show({
        type: 'error',
        text1: 'MFA Requerido',
        text2: 'Necesitas activar la autenticación de dos factores en soycedi.com',
        position: 'bottom',
        visibilityTime: 3000,
        props: {
          style: {
            width: '90%',
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            marginBottom: 16,
          },
          text1Style: {
            fontFamily: 'ClashDisplay',
            fontSize: 16,
            color: colors.black,
            marginBottom: 4,
          },
          text2Style: {
            fontFamily: 'ClashDisplay',
            fontSize: 14,
            color: colors.darkGray,
          }
        }
      });
      bottomSheetRef.current?.expand();
      return;
    }
    router.push('/deposit');
  };

  const handleCardPress = () => {
    router.push('/card');
  };

  const handleEnableMfa = () => {
    Linking.openURL('https://soycedi.com/dashboard');
    bottomSheetRef.current?.close();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={handleHomePress}
        >
          <AntDesign 
            name="home" 
            size={24} 
            color={pathname === '/' ? colors.black : colors.lightGray} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.centerButton} onPress={handleDepositPress}>
          <View style={styles.plusButton}>
            <Ionicons name="add" size={32} color={colors.white} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={handleCardPress}>
          <Feather 
            name="credit-card" 
            size={24} 
            color={colors.lightGray} 
          />
        </TouchableOpacity>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>
            Autenticación de dos factores requerida
          </Text>
          <Text style={styles.bottomSheetMessage}>
            Para realizar transferencias, necesitas activar la autenticación de dos factores en tu cuenta. Por favor, actívala desde el dashboard web de CEDI.
          </Text>
          <TouchableOpacity 
            style={styles.enableMfaButton}
            onPress={handleEnableMfa}
          >
            <Text style={styles.enableMfaButtonText}>Ir al dashboard</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <Toast 
        config={{
          error: (props) => (
            <View style={toastStyles.container}>
              <View style={toastStyles.iconContainer}>
                <Feather name="alert-circle" size={24} color={colors.black} />
              </View>
              <View style={toastStyles.textContainer}>
                <Text style={toastStyles.title}>{props.text1}</Text>
                <Text style={toastStyles.message}>{props.text2}</Text>
              </View>
            </View>
          ),
          success: (props) => (
            <View style={toastStyles.container}>
              <View style={[toastStyles.iconContainer, { backgroundColor: colors.black }]}>
                <Feather name="check" size={24} color={colors.white} />
              </View>
              <View style={toastStyles.textContainer}>
                <Text style={toastStyles.title}>{props.text1}</Text>
                <Text style={toastStyles.message}>{props.text2}</Text>
              </View>
            </View>
          )
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.beige,
  },
  tabButton: {
    padding: 8,
  },
  centerButton: {
    marginTop: -40, // Moves the button up to overlap the navbar
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
  },
  bottomSheetIndicator: {
    backgroundColor: colors.lightGray,
    width: 40,
  },
  bottomSheetContent: {
    padding: 24,
  },
  bottomSheetTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
    color: colors.black,
    marginBottom: 12,
  },
  bottomSheetMessage: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 24,
  },
  enableMfaButton: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enableMfaButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
  },
});

const toastStyles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
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
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 4,
  },
  message: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
  },
});