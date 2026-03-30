/**
 * MFA verification modal — uses auth microservice (listMfaFactors, challengeMfaFactor, verifyMfaFactor).
 * Shown before sensitive actions (e.g. payment). On success calls onSuccess(); on close/cancel calls onClose().
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import * as authService from '@/app/services/auth';
import { useTheme } from '@/app/context/ThemeContext';

const CELL_COUNT = 6;

interface ThemeColors {
  border: string;
  text: string;
  blue: string;
  primary: string;
  primaryContrast: string;
  surface: string;
  backgroundSecondary: string;
  textSecondary: string;
}

function OTPCells({
  value,
  onChange,
  theme,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  theme: ThemeColors;
  disabled?: boolean;
}) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, CELL_COUNT);
  }, []);

  const handleKeyPress = (index: number, keyValue: string) => {
    if (keyValue === '' && index > 0) {
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChange(newValue);
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (!/^\d*$/.test(keyValue)) return;
    const newValue = value.substring(0, index) + keyValue + value.substring(index + 1);
    onChange(newValue);
    if (index < CELL_COUNT - 1 && keyValue !== '') {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <View style={styles.otpRow}>
      {Array(CELL_COUNT)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.otpCell,
              { borderColor: theme.border, color: theme.text },
              focusedIndex === index && { borderColor: theme.blue },
              value[index] && { borderColor: theme.blue },
            ]}
            keyboardType="number-pad"
            maxLength={1}
            onFocus={() => setFocusedIndex(index)}
            onChangeText={(text) => handleKeyPress(index, text)}
            value={value[index] || ''}
            selectionColor={theme.blue}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            editable={!disabled}
          />
        ))}
    </View>
  );
}

export interface MfaVerifyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  successMessage?: string;
}

export function MfaVerifyModal({
  visible,
  onClose,
  onSuccess,
  title = 'Confirmar con MFA',
  successMessage = 'Ingresa el código de 6 dígitos de tu aplicación de autenticación',
}: MfaVerifyModalProps) {
  const { theme } = useTheme();
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) setMfaCode('');
  }, [visible]);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.length === 6 && /^\d+$/.test(text)) {
        setMfaCode(text);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No hay un código válido de 6 dígitos en el portapapeles',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo acceder al portapapeles',
      });
    }
  };

  const handleConfirm = async () => {
    if (mfaCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El código debe tener 6 dígitos',
      });
      return;
    }

    setLoading(true);
    try {
      const factors = await authService.listMfaFactors();
      const factor = factors[0];
      if (!factor) {
        Toast.show({
          type: 'error',
          text1: 'MFA no configurado',
          text2: 'Activa la autenticación de dos factores en tu cuenta.',
        });
        return;
      }
      const challengeData = await authService.challengeMfaFactor(factor.id);
      await authService.verifyMfaFactor(factor.id, challengeData.id, mfaCode);
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Código inválido. Intenta de nuevo.';
      Toast.show({
        type: 'error',
        text1: 'Error de verificación',
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surface }]}
              hitSlop={8}
            >
              <Feather name="x" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.body}>
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {successMessage}
            </Text>
            <OTPCells
              value={mfaCode}
              onChange={setMfaCode}
              theme={theme}
              disabled={loading}
            />
            <TouchableOpacity
              style={[styles.pasteBtn, { backgroundColor: theme.surface }]}
              onPress={handlePaste}
              disabled={loading}
            >
              <Feather name="clipboard" size={18} color={theme.text} />
              <Text style={[styles.pasteText, { color: theme.text }]}>Pegar código</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: theme.primary },
                (mfaCode.length !== 6 || loading) && { opacity: 0.6 },
              ]}
              onPress={handleConfirm}
              disabled={mfaCode.length !== 6 || loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.primaryContrast} />
              ) : (
                <Text style={[styles.confirmText, { color: theme.primaryContrast }]}>
                  Confirmar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 24,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
  },
  body: {
    padding: 24,
  },
  message: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    alignSelf: 'center',
  },
  otpCell: {
    width: 40,
    height: 44,
    borderWidth: 2,
    borderRadius: 10,
    fontSize: 18,
    fontFamily: 'ClashDisplay',
    textAlign: 'center',
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  pasteText: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    marginLeft: 8,
  },
  confirmBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
  },
});
