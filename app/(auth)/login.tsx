import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '../constants/colors';
import { supabase } from '@/app/src/db';
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<{email: string, password: string} | null>(null);

  useEffect(() => {
    checkBiometricSupport();
    loadSavedCredentials();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);
  };

  const loadSavedCredentials = async () => {
    try {
      const storedCredentials = await SecureStore.getItemAsync('userCredentials');
      if (storedCredentials) {
        setSavedCredentials(JSON.parse(storedCredentials));
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const saveCredentials = async (email: string, password: string) => {
    try {
      const credentials = JSON.stringify({ email, password });
      await SecureStore.setItemAsync('userCredentials', credentials);
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      // First check if we have stored credentials
      const storedCredentials = await SecureStore.getItemAsync('userCredentials');
      
      // Perform biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación biométrica',
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        // If we have stored credentials, use them
        if (storedCredentials) {
          const savedCredentials = JSON.parse(storedCredentials);
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: savedCredentials.email.trim().toLowerCase(),
              password: savedCredentials.password
            });
            
            if (error) throw error;
            
            if (data.user) {
              router.replace('/');
            }
          } catch (error: any) {
            console.error('Biometric login error:', error);
            Toast.show({
              type: 'error',
              text1: 'Error de inicio de sesión',
              text2: 'No se pudo iniciar sesión con biometría. Intenta con tu correo y contraseña.',
              position: 'bottom',
              visibilityTime: 3000,
            });
          }
        } else {
          // No credentials stored - prompt for email to associate with this device's Face ID
          // Show a modal or navigate to a special "first-time biometric" screen
          Toast.show({
            type: 'info',
            text1: 'Configuración necesaria',
            text2: 'Para usar Face ID, primero inicia sesión manualmente una vez.',
            position: 'bottom',
            visibilityTime: 4000,
          });
          
          // Optional: You could set a flag to show a special instruction
          // setShowBiometricOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Biometric error:', error);
      setErrorMessage('Error en autenticación biométrica');
    }
  };

  const handleLogin = async () => {
    try {
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
      
      if (data.user) {
        // Store credentials before navigation
        try {
          await saveCredentials(trimmedEmail, password);
        } catch (credError) {
          console.error('Error saving credentials:', credError);
        }
        
        // Use setTimeout to ensure any state updates complete before navigation
        setTimeout(() => {
          router.replace('/');
        }, 100);
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
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
  };

  return (
    <LinearGradient
      colors={['rgba(249,246,244,1)', 'rgba(249,246,244,1)', 'rgba(232,217,202,1)']}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Empieza tu camino</Text>
        
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

        {isBiometricSupported && (
          <TouchableOpacity 
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
          >
            <Ionicons 
              name={Platform.OS === 'ios' ? 'finger-print' : 'finger-print'} 
              size={24} 
              color={colors.black} 
            />
            <Text style={styles.biometricText}>Usar biometría</Text>
          </TouchableOpacity>
        )}

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('https://soycedi.com/sign-up')}>
            <Text style={styles.signupLink}>Aplica aquí</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Ingresa</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  biometricText: {
    marginLeft: 8,
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.black,
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