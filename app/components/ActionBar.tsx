import React, { useRef, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useRouter, usePathname } from 'expo-router';
import { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MfaVerifyModal } from './MfaVerifyModal';
import * as authService from '@/app/services/auth';

export function ActionBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function checkMfaStatus() {
      if (!user?.id) return;
      try {
        const factors = await authService.listMfaFactors();
        const hasActive = factors.some((f) => f.status === 'verified' || f.status === 'active');
        setMfaEnabled(hasActive);
      } catch (err) {
        console.error('Error checking MFA status:', err);
        setMfaEnabled(false);
      }
    }
    checkMfaStatus();
  }, [user?.id]);

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
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          },
          text1Style: {
            fontFamily: 'ClashDisplay',
            fontSize: 16,
            marginBottom: 4,
          },
          text2Style: {
            fontFamily: 'ClashDisplay',
            fontSize: 14,
          }
        }
      });
      setTimeout(() => {
        Linking.openURL('https://soycedi.com/login');
      }, 3000);
      return;
    }
    setShowMfaModal(true);
  };

  const handleCardPress = () => {
    if (pathname !== '/(tabs)/card') {
      router.push('/(tabs)/card');
    }
  };

  const handlePendingPress = () => {
    if (!pathname.startsWith('/(tabs)/payment-services')) {
      router.push('/(tabs)/payment-services');
    }
  };

  const handleDispersionsPress = () => {
    if (!pathname.startsWith('/(tabs)/dispersions')) {
      router.push('/(tabs)/dispersions');
    }
  };

  const isActive = (target: string) =>
    pathname === target || pathname.startsWith(target + '/');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.backgroundSecondary, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={handleHomePress}
          activeOpacity={0.7}
        >
          <AntDesign
            name="home"
            size={24}
            color={isActive('/') ? theme.primary : theme.tabInactive}
          />
          <Text style={[styles.tabLabel, { color: isActive('/') ? theme.primary : theme.tabInactive }]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={handlePendingPress} activeOpacity={0.7}>
          <Feather
            name="shopping-bag"
            size={24}
            color={isActive('/(tabs)/payment-services') ? theme.primary : theme.tabInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: isActive('/(tabs)/payment-services') ? theme.primary : theme.tabInactive },
            ]}
          >
            Pagos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.centerButton} onPress={handleDepositPress} activeOpacity={0.85}>
          <View style={[styles.plusButton, { backgroundColor: theme.primary, shadowColor: theme.shadowStrong }]}>
            <Ionicons name="add" size={32} color={theme.primaryContrast} />
          </View>
          <Text
            style={[
              styles.centerLabel,
              { color: isActive('/deposit') ? theme.primary : theme.tabInactive },
            ]}
          >
            Transferir
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={handleDispersionsPress} activeOpacity={0.7}>
          <Feather
            name="file-text"
            size={24}
            color={isActive('/(tabs)/dispersions') ? theme.primary : theme.tabInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: isActive('/(tabs)/dispersions') ? theme.primary : theme.tabInactive },
            ]}
          >
            Cuenta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={handleCardPress} activeOpacity={0.7}>
          <Feather
            name="credit-card"
            size={24}
            color={isActive('/card') ? theme.primary : theme.tabInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: isActive('/card') ? theme.primary : theme.tabInactive },
            ]}
          >
            Tarjeta
          </Text>
        </TouchableOpacity>
      </View>

      <MfaVerifyModal
        visible={showMfaModal}
        onClose={() => setShowMfaModal(false)}
        onSuccess={() => {
          setShowMfaModal(false);
          if (pathname !== '/(tabs)/deposit') {
            router.push('/(tabs)/deposit');
          }
        }}
        title="Confirmar transferencia"
        successMessage="Ingresa el código de 6 dígitos de tu aplicación de autenticación para continuar con la transferencia."
      />

      <Toast
        config={{
          error: (props) => (
            <View style={[toastStyles.container, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[toastStyles.iconContainer, { backgroundColor: theme.surface }]}>
                <Feather name="alert-circle" size={24} color={theme.error} />
              </View>
              <View style={toastStyles.textContainer}>
                <Text style={[toastStyles.title, { color: theme.text }]}>{props.text1}</Text>
                <Text style={[toastStyles.message, { color: theme.textSecondary }]}>{props.text2}</Text>
              </View>
            </View>
          ),
          success: (props) => (
            <View style={[toastStyles.container, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[toastStyles.iconContainer, { backgroundColor: theme.primary }]}>
                <Feather name="check" size={24} color={theme.primaryContrast} />
              </View>
              <View style={toastStyles.textContainer}>
                <Text style={[toastStyles.title, { color: theme.text }]}>{props.text1}</Text>
                <Text style={[toastStyles.message, { color: theme.textSecondary }]}>{props.text2}</Text>
              </View>
            </View>
          ),
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  tabButton: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 11,
    marginTop: 4,
  },
  centerButton: {
    marginTop: -36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 11,
    marginTop: 4,
  },
  plusButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

const toastStyles = StyleSheet.create({
  container: {
    width: '90%',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
  },
});