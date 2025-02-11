import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { colors } from '@/app/constants/colors';
import { useEffect, useRef } from 'react';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

interface MovementData {
  amount: number;
  commission: number;
  finalAmount: number;
  recipientName: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  clave_rastreo: string;
  concept?: string;
  concept2?: string;
  status?: string;
}

export default function ProcessingScreen() {
  const params = useLocalSearchParams<{ movementData: string }>();
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start loading animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loadingAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Parse the movement data to ensure all fields are present
    const movementData = params.movementData ? JSON.parse(params.movementData) as MovementData : null;
    
    // Navigate to success screen after 10 seconds
    const timer = setTimeout(() => {
      router.replace({
        pathname: '/(tabs)/deposit/success',
        params: {
          movementData: JSON.stringify({
            ...movementData,
            beneficiaryName: movementData?.recipientName,
            bankName: movementData?.bankName,
            status: 'COMPLETED'
          })
        }
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [params.movementData]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')} 
            style={styles.logo}
          contentFit="contain"
        />
        </View>
      <Text style={styles.loadingText}>Procesando transferencia...</Text>
      <View style={styles.loaderContainer}>
        <Animated.View 
          style={[
            styles.loadingBar,
            {
              transform: [{
                translateX: loadingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 100]
                })
              }]
            }
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  loadingText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 30,
  },
  loaderContainer: {
    width: '80%',
    height: 2,
    backgroundColor: colors.beige,
    overflow: 'hidden',
    borderRadius: 1,
  },
  loadingBar: {
    width: 100,
    height: '100%',
    backgroundColor: colors.black,
    borderRadius: 1,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
});