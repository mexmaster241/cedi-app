import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { db } from '@/app/src/db';
import * as authService from '@/app/services/auth';
import { Skeleton } from '@/app/components/Skeleton';
import Toast from 'react-native-toast-message';
import QRCodeSVG from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import Constants from 'expo-constants';
import { colors } from '@/app/constants/colors';

// OTP Input Component
const OTPInput = ({ 
  value, 
  onChange, 
  cellCount = 6 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  cellCount?: number; 
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleCellFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleKeyPress = (index: number, keyValue: string) => {
    const newValue = value.substring(0, index) + keyValue + value.substring(index + 1);
    onChange(newValue);
    if (index < cellCount - 1 && keyValue !== '') {
      setFocusedIndex(index + 1);
    }
  };

  return (
    <View style={otpStyles.container}>
      {Array(cellCount).fill(0).map((_, index) => (
        <TextInput
          key={index}
          style={[otpStyles.cell, focusedIndex === index && otpStyles.focusedCell]}
          keyboardType="number-pad"
          maxLength={1}
          onFocus={() => handleCellFocus(index)}
          onChangeText={(text) => handleKeyPress(index, text)}
          value={value[index] || ''}
          selectionColor={colors.black}
        />
      ))}
    </View>
  );
};

// QR Code component that works on both web and mobile
const QRCode = ({
  value,
  size = 200
}: {
  value: string;
  size?: number;
}) => {
  // For web, use Google Charts API
  if (Platform.OS === 'web') {
    const encodedValue = encodeURIComponent(value);
    return (
      <img 
        src={`https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedValue}&choe=UTF-8`}
        width={size}
        height={size}
        alt="QR Code"
      />
    );
  }
  
  // For mobile, use react-native-qrcode-svg
  return (
    <QRCodeSVG
      value={value}
      size={size}
      color={colors.black}
      backgroundColor={colors.white}
    />
  );
};

// MFA Setup Component
interface MFASetupProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userEmail: string;
}

const MFASetup = ({ isVisible, onClose, onSuccess, userId, userEmail }: MFASetupProps) => {
  const [step, setStep] = useState<'initial' | 'scan' | 'verify'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  const startSetup = async () => {
    setIsLoading(true);
    try {
      // Clean up any existing unverified factors
      const existingFactors = await authService.listMfaFactors();
      for (const factor of existingFactors) {
        if (factor.status === 'unverified') {
          await authService.unenrollMfaFactor(factor.id);
        }
      }

      // Enroll new factor
      const timestamp = new Date().getTime();
      const data = await authService.enrollMfaFactor(
        'totp',
        'cedi',
        `cedi-${userEmail}-${timestamp}`
      );

      setSecret(data.factor?.totp?.secret ?? '');
      setFactorId(data.id);
      setStep('scan');
    } catch (error: any) {
      console.error('Error setting up MFA:', error);
      Alert.alert('Error', 'No se pudo configurar la autenticaci?n de dos factores');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(secret);
      setCopied(true);
      
      Toast.show({
        type: 'success',
        text1: 'C?digo copiado',
        text2: 'El c?digo ha sido copiado al portapapeles',
        position: 'bottom',
        visibilityTime: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'No se pudo copiar al portapapeles');
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) return;
    
    setIsLoading(true);
    try {
      // Create challenge
      const challengeData = await authService.challengeMfaFactor(factorId);

      // Verify challenge
      await authService.verifyMfaFactor(factorId, challengeData.id, verificationCode);

      // Update user MFA status
      await db.users.createOrUpdate({
        id: userId,
        email: userEmail,
        mfa_enabled: true
      });

      Toast.show({
        type: 'success',
        text1: 'MFA Activado',
        text2: 'La autenticaci?n de dos factores ha sido activada correctamente',
        position: 'bottom',
        visibilityTime: 3000,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      Alert.alert('Error', 'C?digo incorrecto o ha ocurrido un error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Autenticaci?n de dos factores</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Feather name="x" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>

          {step === 'initial' && (
            <View style={modalStyles.content}>
              <Text style={modalStyles.description}>
                La autenticaci?n de dos factores agrega una capa adicional de seguridad a tu cuenta.
                Necesitar?s instalar una aplicaci?n de autenticaci?n como Google Authenticator o Microsoft Authenticator.
              </Text>
              <TouchableOpacity 
                style={modalStyles.button}
                onPress={startSetup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={modalStyles.buttonText}>Comenzar configuraci?n</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 'scan' && (
            <View style={modalStyles.content}>
              <Text style={modalStyles.secretLabel}>
                Ingresa este c?digo en tu aplicaci?n de autenticaci?n:
              </Text>
              
              <View style={modalStyles.secretCodeBox}>
                <Text style={modalStyles.secretCode}>{secret}</Text>
                <TouchableOpacity 
                  style={modalStyles.copyButton}
                  onPress={copyToClipboard}
                >
                  <Feather 
                    name={copied ? "check" : "copy"} 
                    size={18} 
                    color={copied ? colors.black : colors.darkGray} 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={modalStyles.instruction}>
                Despu?s de agregar, ingresa el c?digo de 6 d?gitos generado:
              </Text>
              <OTPInput 
                value={verificationCode} 
                onChange={setVerificationCode} 
              />
              <TouchableOpacity 
                style={[
                  modalStyles.button,
                  verificationCode.length !== 6 && modalStyles.buttonDisabled
                ]}
                onPress={verifyCode}
                disabled={verificationCode.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={modalStyles.buttonText}>Verificar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Disable MFA Dialog
interface DisableMFADialogProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userEmail: string;
}

const DisableMFADialog = ({ isVisible, onClose, onSuccess, userId, userEmail }: DisableMFADialogProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDisableMFA = async () => {
    if (verificationCode.length !== 6) return;
    
    setIsLoading(true);
    try {
      // List factors to find the active one
      const factors = await authService.listMfaFactors();
      const factor = factors[0];

      if (!factor) throw new Error('No MFA factor found');

      // Challenge the factor
      const challengeData = await authService.challengeMfaFactor(factor.id);

      // Verify the challenge with the code
      await authService.verifyMfaFactor(factor.id, challengeData.id, verificationCode);

      // Unenroll the factor
      await authService.unenrollMfaFactor(factor.id);

      // Update user MFA status
      if (userEmail) {
        await db.users.createOrUpdate({
          id: userId,
          email: userEmail,
          mfa_enabled: false
        });
      }

      Toast.show({
        type: 'success',
        text1: 'MFA Desactivado',
        text2: 'La autenticaci?n de dos factores ha sido desactivada',
        position: 'bottom',
        visibilityTime: 3000,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error disabling MFA:', error);
      Alert.alert('Error', 'C?digo incorrecto o ha ocurrido un error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Desactivar autenticaci?n</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Feather name="x" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
          <View style={modalStyles.content}>
            <Text style={modalStyles.description}>
              Para desactivar la autenticaci?n de dos factores, ingresa el c?digo generado por tu aplicaci?n de autenticaci?n:
            </Text>
            <OTPInput 
              value={verificationCode} 
              onChange={setVerificationCode} 
            />
            <TouchableOpacity 
              style={[
                modalStyles.button,
                modalStyles.buttonDanger,
                verificationCode.length !== 6 && modalStyles.buttonDisabled
              ]}
              onPress={handleDisableMFA}
              disabled={verificationCode.length !== 6 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={modalStyles.buttonText}>Desactivar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MENU_ITEMS: { key: string; label: string; icon: keyof typeof Feather.glyphMap; route?: string; status?: string }[] = [
  { key: 'limits', label: 'Límite transaccional', icon: 'bar-chart-2' },
  { key: 'password', label: 'Cambiar contraseña', icon: 'key' },
  { key: 'fingerprint', label: 'Huella digital', icon: 'shield', status: 'Activo' },
  { key: 'phone', label: 'Asociar / cambiar celular', icon: 'phone' },
  { key: 'health', label: 'Salud financiera', icon: 'heart' },
  { key: 'statement', label: 'Estado de cuenta', icon: 'file-text' },
];

export default function ProfileScreen() {
  const { colorScheme, theme, setMode } = useTheme();
  const { user, loading: authLoading, refreshAuth } = useAuth();
  const params = useLocalSearchParams<{ name?: string; email?: string }>();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [showDisableMFA, setShowDisableMFA] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await db.users.getOptional(user.id);
        if (!cancelled) setMfaEnabled(data?.mfa_enabled ?? false);
      } catch {
        if (!cancelled) setMfaEnabled(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      try {
        const data = await db.users.getOptional(user.id);
        setMfaEnabled(data?.mfa_enabled ?? false);
      } catch {
        setMfaEnabled(false);
      }
    }
    setRefreshing(false);
  }, [user?.id]);

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await Clipboard.setStringAsync(value);
      Toast.show({
        type: 'success',
        text1: 'Copiado',
        text2: `${label} copiado al portapapeles`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo copiar',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  }, []);

  const handleLogout = useCallback(() => {
    // En web, Alert.alert es un no-op; cerramos sesión directamente.
    if (Platform.OS === 'web') {
      (async () => {
        try {
          await authService.signOut();
          await refreshAuth();
          router.replace('/intro');
        } catch (e) {
          console.error('Error logging out:', e);
        }
      })();
      return;
    }

    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              await refreshAuth();
              router.replace('/intro');
            } catch (e) {
              console.error('Error logging out:', e);
            }
          },
        },
      ]
    );
  }, [refreshAuth]);

  const handleMenuPress = useCallback(
    (key: string) => {
      if (key === 'password') {
        if (mfaEnabled) {
          setShowDisableMFA(true);
        } else {
          setShowMFASetup(true);
        }
        return;
      }
      // Otros ítems: navegar o "Próximamente"
      Toast.show({
        type: 'info',
        text1: 'Próximamente',
        text2: 'Esta función estará disponible pronto',
        position: 'bottom',
        visibilityTime: 2000,
      });
    },
    [mfaEnabled]
  );

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const paramName = typeof params.name === 'string' ? params.name : undefined;
  const paramEmail = typeof params.email === 'string' ? params.email : undefined;
  const displayName = paramName ?? 'Usuario';
  const displayEmail = paramEmail ?? '';
  const handleToggleTheme = useCallback(() => {
    setMode(colorScheme === 'dark' ? 'light' : 'dark');
  }, [colorScheme, setMode]);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={theme.icon} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: theme.text }]}>Perfil</Text>
          </View>
          <TouchableOpacity
            onPress={handleToggleTheme}
            style={styles.themeToggleButton}
            hitSlop={12}
          >
            <Feather
              name={colorScheme === 'dark' ? 'sun' : 'moon'}
              size={20}
              color={theme.icon}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.text}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Profile header: avatar + badge + Usuario */}
          <View style={[styles.profileBlock, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <View style={styles.avatarRow}>
              <View style={[styles.avatarWrap, { borderColor: theme.border }]}>
                {authLoading ? (
                  <Skeleton width={88} height={88} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
                    <Feather name="user" size={44} color={theme.iconMuted} />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.editAvatarBtn, { backgroundColor: theme.blue }]}
                  onPress={() => Toast.show({ type: 'info', text1: 'Próximamente', position: 'bottom', visibilityTime: 2000 })}
                >
                  <Feather name="edit-2" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileLabels}>
                <View style={styles.fieldBlock}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Usuario:</Text>
                  <View style={styles.valueCopyRow}>
                    <Text style={[styles.fieldValue, { color: theme.text }]} numberOfLines={1}>
                      {authLoading ? '—' : displayName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopy(displayName, 'Usuario')}
                      hitSlop={10}
                      style={styles.copyBtn}
                    >
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.fieldBlock}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Correo:</Text>
                  <View style={styles.valueCopyRow}>
                    <Text style={[styles.fieldValue, { color: theme.text }]} numberOfLines={1}>
                      {authLoading ? '—' : displayEmail}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopy(displayEmail, 'Correo')}
                      hitSlop={10}
                      style={styles.copyBtn}
                    >
                      <Feather name="copy" size={18} color={theme.iconMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles.validadaRow, { borderTopColor: theme.border }]}>
              <Feather name="check-circle" size={18} color={theme.success} />
              <Text style={[styles.validadaText, { color: theme.success }]}>Validada</Text>
            </View>
          </View>

          {/* Menu list */}
          <View style={styles.menuSection}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handleMenuPress(item.key)}
                activeOpacity={0.7}
              >
                <Feather name={item.icon} size={22} color={theme.icon} />
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                {item.status ? (
                  <Text style={[styles.menuStatus, { color: theme.textMuted }]}>{item.status}</Text>
                ) : null}
                <Feather name="chevron-right" size={20} color={theme.iconMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Feather name="log-out" size={22} color={theme.error} />
              <Text style={[styles.logoutLabel, { color: theme.error }]}>Cerrar sesión</Text>
              <Feather name="chevron-right" size={20} color={theme.iconMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.version, { color: theme.textMuted }]}>V. {appVersion}</Text>
        </ScrollView>

        {user && (
          <>
            <MFASetup
              isVisible={showMFASetup}
              onClose={() => setShowMFASetup(false)}
              onSuccess={async () => {
                if (user?.id) {
                  try {
                    const data = await db.users.getOptional(user.id);
                    setMfaEnabled(data?.mfa_enabled ?? false);
                  } catch {
                    setMfaEnabled(false);
                  }
                }
              }}
              userId={user.id}
              userEmail={paramEmail ?? user.email ?? ''}
            />
            <DisableMFADialog
              isVisible={showDisableMFA}
              onClose={() => setShowDisableMFA(false)}
              onSuccess={async () => {
                if (user?.id) {
                  try {
                    const data = await db.users.getOptional(user.id);
                    setMfaEnabled(data?.mfa_enabled ?? false);
                  } catch {
                    setMfaEnabled(false);
                  }
                }
              }}
              userId={user.id}
              userEmail={paramEmail ?? user.email ?? ''}
            />
          </>
        )}
      </SafeAreaView>
      <Toast />
    </>
  );
}

const ROUNDED = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  themeToggleButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerCenter: {
    flex: 1,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
  },
  subtitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileBlock: {
    borderRadius: ROUNDED,
    borderWidth: 1,
    padding: 24,
    marginBottom: 32,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    borderWidth: 2,
    borderRadius: 999,
    padding: 4,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLabels: {
    flex: 1,
    marginLeft: 20,
    minWidth: 0,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    marginBottom: 4,
  },
  valueCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  fieldValue: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    flex: 1,
  },
  copyBtn: {
    padding: 6,
    marginLeft: 8,
  },
  validadaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  validadaText: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
    marginLeft: 6,
  },
  menuSection: {
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: ROUNDED,
    borderWidth: 1,
    marginBottom: 10,
  },
  menuLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    flex: 1,
    marginLeft: 14,
  },
  menuStatus: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    marginRight: 8,
  },
  logoutSection: {
    marginTop: 28,
    marginBottom: 24,
  },
  logoutItem: {},
  logoutLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    flex: 1,
    marginLeft: 14,
  },
  version: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    color: colors.black,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  description: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: colors.lightGray,
  },
  buttonDanger: {
    backgroundColor: colors.red,
  },
  buttonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
  },
  secretLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
    textAlign: 'center',
  },
  secretCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.beige,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  secretCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    color: colors.black,
    letterSpacing: 0.5,
    marginRight: 12,
  },
  copyButton: {
    padding: 6,
    backgroundColor: colors.white,
    borderRadius: 6,
  },
  instruction: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 16,
    textAlign: 'center',
  },
});

const otpStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cell: {
    width: 45,
    height: 50,
    lineHeight: 50,
    fontSize: 24,
    borderWidth: 2,
    borderColor: colors.beige,
    borderRadius: 8,
    textAlign: 'center',
    fontFamily: 'ClashDisplay',
    color: colors.black,
  },
  focusedCell: {
    borderColor: colors.black,
  },
});
