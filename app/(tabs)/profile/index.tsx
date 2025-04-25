import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/app/constants/colors';
import { getCurrentUser, db, supabase } from '@/app/src/db';
import { Skeleton } from '@/app/components/Skeleton';
import Toast from 'react-native-toast-message';
import QRCodeSVG from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

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
      // Clean up any existing factors
      const { data: existingFactors } = await supabase.auth.mfa.listFactors();
      for (const factor of (existingFactors?.totp || [])) {
        if (factor.status === 'unverified') {
          await supabase.auth.mfa.unenroll({
            factorId: factor.id
          });
        }
      }

      // Enroll new factor
      const timestamp = new Date().getTime();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'cedi',
        friendlyName: `cedi-${userEmail}-${timestamp}`
      });

      if (error) throw error;

      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('scan');
    } catch (error: any) {
      console.error('Error setting up MFA:', error);
      Alert.alert('Error', 'No se pudo configurar la autenticación de dos factores');
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
        text1: 'Código copiado',
        text2: 'El código ha sido copiado al portapapeles',
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
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });

      if (challengeError) throw challengeError;

      // Verify challenge
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (verifyError) throw verifyError;

      // Update user MFA status
      await db.users.createOrUpdate({
        id: userId,
        email: userEmail,
        mfa_enabled: true
      });

      Toast.show({
        type: 'success',
        text1: 'MFA Activado',
        text2: 'La autenticación de dos factores ha sido activada correctamente',
        position: 'bottom',
        visibilityTime: 3000,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      Alert.alert('Error', 'Código incorrecto o ha ocurrido un error');
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
            <Text style={modalStyles.title}>Autenticación de dos factores</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Feather name="x" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>

          {step === 'initial' && (
            <View style={modalStyles.content}>
              <Text style={modalStyles.description}>
                La autenticación de dos factores agrega una capa adicional de seguridad a tu cuenta.
                Necesitarás instalar una aplicación de autenticación como Google Authenticator o Microsoft Authenticator.
              </Text>
              <TouchableOpacity 
                style={modalStyles.button}
                onPress={startSetup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={modalStyles.buttonText}>Comenzar configuración</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 'scan' && (
            <View style={modalStyles.content}>
              <Text style={modalStyles.secretLabel}>
                Ingresa este código en tu aplicación de autenticación:
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
                Después de agregar, ingresa el código de 6 dígitos generado:
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
}

const DisableMFADialog = ({ isVisible, onClose, onSuccess, userId }: DisableMFADialogProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDisableMFA = async () => {
    if (verificationCode.length !== 6) return;
    
    setIsLoading(true);
    try {
      // List factors to find the active one
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const factor = factorsData?.totp?.[0];

      if (!factor) throw new Error('No MFA factor found');

      // Challenge the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factor.id
      });

      if (challengeError) throw challengeError;

      // Verify the challenge with the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (verifyError) throw verifyError;

      // Unenroll the factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: factor.id,
      });

      if (unenrollError) throw unenrollError;

      // Update user MFA status
      const user = await getCurrentUser();
      if (user) {
        await db.users.createOrUpdate({
          id: userId,
          email: user.email!,
          mfa_enabled: false
        });
      }

      Toast.show({
        type: 'success',
        text1: 'MFA Desactivado',
        text2: 'La autenticación de dos factores ha sido desactivada',
        position: 'bottom',
        visibilityTime: 3000,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error disabling MFA:', error);
      Alert.alert('Error', 'Código incorrecto o ha ocurrido un error');
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
            <Text style={modalStyles.title}>Desactivar autenticación</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Feather name="x" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
          <View style={modalStyles.content}>
            <Text style={modalStyles.description}>
              Para desactivar la autenticación de dos factores, ingresa el código generado por tu aplicación de autenticación:
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

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  company: string;
  mfa_enabled: boolean;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [showDisableMFA, setShowDisableMFA] = useState(false);

  const loadUserProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const userData = await db.users.getByEmail(currentUser.email!);
        setUserProfile({
          id: userData.id,
          full_name: userData.given_name + ' ' + userData.family_name || 'Usuario',
          email: userData.email || currentUser.email!,
          company: userData.company_name || 'Empresa no especificada',
          mfa_enabled: userData.mfa_enabled || false
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUserProfile();
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const renderSkeletonContent = () => (
    <>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: colors.beige }]}>
      
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Skeleton width={100} height={14} />
          <View style={{ height: 8 }} />
          <Skeleton width={200} height={16} />
        </View>

        <View style={styles.infoItem}>
          <Skeleton width={120} height={14} />
          <View style={{ height: 8 }} />
          <Skeleton width={180} height={16} />
        </View>

        <View style={styles.infoItem}>
          <Skeleton width={80} height={14} />
          <View style={{ height: 8 }} />
          <Skeleton width={160} height={16} />
        </View>
      </View>
    </>
  );

  const renderContent = () => (
    <>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Feather name="user" size={64} color={colors.black} />
        </View>
      </View>

      {userProfile && (
        <>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Nombre completo</Text>
              <Text style={styles.value}>{userProfile.full_name}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Correo electrónico</Text>
              <Text style={styles.value}>{userProfile.email}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Empresa</Text>
              <Text style={styles.value}>{userProfile.company}</Text>
            </View>
          </View>

          <View style={styles.securityContainer}>
            <Text style={styles.sectionTitle}>Seguridad</Text>
            
            <View style={styles.securityItem}>
              <View style={styles.securityInfo}>
                <Text style={styles.securityLabel}>Autenticación de dos factores</Text>
                <View style={[
                  styles.badge, 
                  userProfile.mfa_enabled ? styles.badgeEnabled : styles.badgeDisabled
                ]}>
                  <Text style={[
                    styles.badgeText,
                    userProfile.mfa_enabled ? styles.badgeTextEnabled : styles.badgeTextDisabled
                  ]}>
                    {userProfile.mfa_enabled ? "Activado" : "Desactivado"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </>
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Perfil</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.black}
              colors={[colors.black]}
              progressBackgroundColor={colors.beige}
            />
          }
        >
          {isLoading ? renderSkeletonContent() : renderContent()}
        </ScrollView>

        {userProfile && (
          <>
            <MFASetup 
              isVisible={showMFASetup} 
              onClose={() => setShowMFASetup(false)} 
              onSuccess={loadUserProfile}
              userId={userProfile.id}
              userEmail={userProfile.email}
            />
            <DisableMFADialog 
              isVisible={showDisableMFA} 
              onClose={() => setShowDisableMFA(false)} 
              onSuccess={loadUserProfile}
              userId={userProfile.id}
            />
          </>
        )}
      </SafeAreaView>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
    color: colors.black,
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.beige,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 4,
  },
  value: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
  },
  securityContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    color: colors.black,
    marginBottom: 16,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.black,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEnabled: {
    backgroundColor: '#E7F5E8', // light green background
  },
  badgeDisabled: {
    backgroundColor: '#FFEFEF', // light red background
  },
  badgeText: {
    fontFamily: 'ClashDisplay',
    fontSize: 12,
    fontWeight: '500',
  },
  badgeTextEnabled: {
    color: '#2D7738', // dark green text
  },
  badgeTextDisabled: {
    color: '#D64545', // dark red text
  },
  button: {
    backgroundColor: colors.black,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonDanger: {
    backgroundColor: colors.red,
  },
  buttonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.white,
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
