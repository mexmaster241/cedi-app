import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '../constants/colors';
import { supabase } from '@/app/src/db';
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });
      
      if (error) throw error;
      
      // After successful login, offer to enable biometric quick login
      if (data.user && data.session) {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = compatible ? await LocalAuthentication.isEnrolledAsync() : false;
        if (compatible && enrolled && data.session.refresh_token) {
          console.log('[Biometric] Prompting user to enable biometrics');
          Alert.alert(
            'Usar biometría',
            '¿Quieres usar Face ID/biometría para ingresar la próxima vez?',
            [
              { text: 'No', style: 'cancel' },
              { 
                text: 'Sí', 
                onPress: async () => {
                  try {
                    console.log('[Biometric] Storing refresh token');
                    await SecureStore.setItemAsync('biometricEnabled', 'true');
                    await SecureStore.setItemAsync('supabaseRefreshToken', data.session.refresh_token);
                    setBiometricEnabled(true);
                    console.log('[Biometric] Stored. Enabled = true');
                  } catch (e) {
                    console.log('[Biometric] Error storing tokens', e);
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
      console.log('[Biometric] compatible:', compatible, 'enrolled:', enrolled, 'enabled state:', biometricEnabled);
      if (!compatible || !enrolled) return;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentícate para ingresar',
        fallbackLabel: 'Ingresar con contraseña',
      });
      console.log('[Biometric] auth result:', result.success);
      if (!result.success) return;

      const refreshToken = await SecureStore.getItemAsync('supabaseRefreshToken');
      console.log('[Biometric] has refresh token:', !!refreshToken);
      if (!refreshToken) return;

      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      console.log('[Biometric] setSession result error?', !!error, 'session?', !!data?.session);
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudo iniciar sesión con biometría',
          position: 'bottom',
          visibilityTime: 3000,
        });
      }
      // On success, _layout will redirect
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
        const enabled = await SecureStore.getItemAsync('biometricEnabled');
        setBiometricEnabled(enabled === 'true');
        if (enabled === 'true' && compatible && enrolled) {
          // Auto-prompt biometrics if enabled
          console.log('[Biometric] Auto-prompting');
          handleBiometricAuth();
        }
      } catch {}
    })();
  }, []);

  return (
    <LinearGradient
      colors={['rgba(249,246,244,1)', 'rgba(249,246,244,1)', 'rgba(232,217,202,1)']}
      style={styles.container}
    >
      <View style={styles.formContainer}>
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
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color="black" 
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
          style={[styles.button, isSubmitting && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Ingresa</Text>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  formContainer: {
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'ClashDisplay',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'ClashDisplay',
    color: colors.black,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.black,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'ClashDisplay',
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
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
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