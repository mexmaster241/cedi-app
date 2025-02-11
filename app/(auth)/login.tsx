import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '../constants/colors';
import { supabase } from '@/app/src/db';
import NetInfo from "@react-native-community/netinfo";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
        router.replace('/');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      switch(error.message) {
        case 'Email not confirmed':
          setErrorMessage('Por favor verifica tu cuenta de email');
          break;
        case 'Invalid login credentials':
          setErrorMessage('Email o contraseña incorrectos');
          break;
        case 'User not found':
          setErrorMessage('No existe una cuenta con este email');
          break;
        default:
          setErrorMessage('Hubo un error inesperado. Por favor intenta de nuevo.');
      }
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
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry
          />
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('https://main.d3n362okhpkge4.amplifyapp.com/sign-up')}>
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
});