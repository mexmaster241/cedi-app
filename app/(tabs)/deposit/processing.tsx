import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { colors } from '@/app/constants/colors';
import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

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
  const [progress, setProgress] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Parse the movement data to ensure all fields are present
    const movementData = params.movementData ? JSON.parse(params.movementData) as MovementData : null;
    
    // Animate progress from 0 to 100
    Animated.timing(animatedValue, {
      toValue: 100,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: false
    }).start();

    // Update visible progress value
    const subscription = animatedValue.addListener(({ value }) => {
      setProgress(Math.floor(value));
    });

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

    return () => {
      animatedValue.removeListener(subscription);
      clearTimeout(timer);
    };
  }, [params.movementData]);

  // SVG circle progress calculation
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
      
      <View style={styles.progressContainer}>
        <Svg width={size} height={size}>
          <Circle
            stroke="#e5e5e5"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke="#000000"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.progressText}>{progress}%</Text>
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
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  }
});