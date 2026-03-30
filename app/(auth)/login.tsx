import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions, useColorScheme } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors } from '../constants/colors';
import { light, dark } from '@/app/constants/theme';
import { primaryButtonStyle, primaryButtonTextStyle } from '@/app/constants/buttons';
import * as authService from '@/app/services/auth';
import { useAuth } from '@/app/context/AuthContext';

const INPUT_PADDING = 20;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as safeStorage from '@/app/services/auth/safe-storage';
 

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? dark : light;
  const { refreshAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      if (!email || !password) {
        setErrorMessage('Por favor ingresa tu email y contraseña');
        return;
      }
      
      // Check network status
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        setErrorMessage('No hay conexión a internet');
        return;
      }

      const trimmedEmail = email.trim().toLowerCase();

      const result = await authService.signIn(trimmedEmail, password);
      if (result.error) throw new Error(result.error.message);

      const { session } = result.data!;
      await refreshAuth();

      // After successful login, offer to enable biometric quick login
      if (session?.user && session?.refresh_token) {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = compatible ? await LocalAuthentication.isEnrolledAsync() : false;
        if (compatible && enrolled && session?.refresh_token) {
          Alert.alert(
            'Usar biometría',
            '¿Quieres usar Face ID/biometría para ingresar la próxima vez?',
            [
              { text: 'No', style: 'cancel' },
              { 
                text: 'Sí', 
                onPress: async () => {
                  try {
                    await safeStorage.setItem('biometricEnabled', 'true');
                    if (session.refresh_token) {
                      await safeStorage.setItem('supabaseRefreshToken', session.refresh_token);
                    }
                    setBiometricEnabled(true);
                  } catch (e) {
                  }
                }
              }
            ]
          );
        } else {
          console.log('[Biometric] Not compatible or no refresh token');
        }
      }
      
    } catch (error: any) {
      let errorTitle = 'Error';
      let errorMessage = 'Hubo un error inesperado. Por favor intenta de nuevo.';
      
      switch(error.message) {
        case 'Email not confirmed':
          errorMessage = 'Por favor verifica tu cuenta de email';
          break;
        case 'Invalid login credentials':
          errorMessage = 'Email o contraseña incorrectos';
          break;
        case 'User not found':
          errorMessage = 'No existe una cuenta con este email';
          break;
      }
      
      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = compatible ? await LocalAuthentication.isEnrolledAsync() : false;
      if (!compatible || !enrolled) return;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentícate para ingresar',
        fallbackLabel: 'Ingresar con contraseña',
      });
      if (!result.success) return;

      const refreshToken = await safeStorage.getItem('supabaseRefreshToken');
      if (!refreshToken) return;

      const refreshResult = await authService.refreshSession(refreshToken);
      if (refreshResult.error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudo iniciar sesión con biometría',
          position: 'bottom',
          visibilityTime: 3000,
        });
      } else {
        await refreshAuth();
      }
    } catch {
      // Silent fail to keep login available
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = compatible ? await LocalAuthentication.isEnrolledAsync() : false;
        setIsBiometricSupported(compatible && enrolled);
        const enabled = await safeStorage.getItem('biometricEnabled');
        setBiometricEnabled(enabled === 'true');
        if (enabled === 'true' && compatible && enrolled) {
          handleBiometricAuth();
        }
      } catch {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.background} pointerEvents="none">
        <Svg width={screenWidth} height={screenHeight} style={styles.backgroundSvg}>
          <Defs>
            <RadialGradient
              id="bgGradient"
              cx="50%"
              cy="10%"
              r="125%"
              fx="50%"
              fy="10%"
            >
              <Stop offset="40%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="100%" stopColor="#7bbcff" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={screenWidth} height={screenHeight} fill="url(#bgGradient)" />
        </Svg>
      </View>
      <View style={styles.formContainer}>
        <Image
          source={require('../../assets/images/cedi-logo-12.webp')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Empieza tu camino</Text>
        {isBiometricSupported && (
          <TouchableOpacity 
            style={styles.biometricButton}
            onPress={() => {
              if (biometricEnabled) {
                handleBiometricAuth();
              } else {
                Alert.alert('Biometría desactivada', 'Inicia sesión y habilítala cuando se te solicite.');
              }
            }}
          >
            <Ionicons name="scan-outline" size={32} color={colors.black} />
          </TouchableOpacity>
        )}
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
            <Ionicons name="mail-outline" size={20} color={colors.darkGray} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputWithIcon]}
              value={email}
              onChangeText={setEmail}
              placeholder="Dirección de correo"
              placeholderTextColor={colors.darkGray}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.darkGray} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputField]}
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              placeholderTextColor={colors.darkGray}
              secureTextEntry={!showPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity
              style={styles.eyeIconButton}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.6}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.darkGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('https://soycedi.com/sign-up')}>
            <Text style={styles.signupLink}>Aplica aquí</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[primaryButtonStyle(theme), isSubmitting && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={primaryButtonTextStyle(theme)}>Ingresa</Text>
              <Ionicons name="arrow-forward-outline" size={20} color={theme.primaryContrast} />
            </>
          )}
        </TouchableOpacity>
      </View>

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
          )
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -10,
  },
  backgroundSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  formContainer: {
    alignItems: 'center',
    marginTop: 0,
    width: '100%',
    paddingHorizontal: INPUT_PADDING,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 22,
  },
  title: {
    fontSize: 28,
    fontFamily: 'FunnelDisplay-400',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 70,
  },
  inputContainer: {
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  inputWrapperFocused: {
    borderColor: '#C0C0C0',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'ClashDisplay',
    color: colors.black,
    textAlignVertical: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: INPUT_PADDING,
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  signupText: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.black,
  },
  signupLink: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.black,
    textDecorationLine: 'underline',
  },
  inputIcon: {
    marginLeft: 16,
  },
  inputWithIcon: {
    paddingLeft: 12,
    paddingRight: 16,
  },
  inputField: {
    paddingLeft: 12,
    paddingRight: 48,
  },
  eyeIconButton: {
    position: 'absolute',
    right: 0,
    height: '100%',
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    padding: 8,
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