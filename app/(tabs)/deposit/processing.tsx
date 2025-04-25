import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { colors } from '@/app/constants/colors';
import { useEffect } from 'react';
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

  useEffect(() => {
    // Parse the movement data to ensure all fields are present
    const movementData = params.movementData ? JSON.parse(params.movementData) as MovementData : null;

    // Navigate to success screen after 3 seconds
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
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
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
      
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
      
      <Text style={styles.loadingText}>Procesando transferencia...</Text>
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
    marginTop: 30,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
});