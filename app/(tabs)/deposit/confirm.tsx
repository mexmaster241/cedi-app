import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/app/constants/colors';
import { useState, useEffect, useRef, useMemo } from 'react';
import { getCurrentUser } from '@/app/src/db';
import { db } from '@/app/src/db';
import Toast from 'react-native-toast-message';
import React from 'react';
import { supabase, supabaseAdmin } from '@/app/src/db';
import { SpeiService } from '@/app/components/spei.service';
import { createTransfer } from '@/app/constants/transfer';
import { BANK_CODES, BANK_TO_INSTITUTION } from '@/app/constants/banks';
import BottomSheet from '@gorhom/bottom-sheet';
import Portal from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';

const COMMISSION_AMOUNT = 5.80;
const COMMISSION_CLABE = '646180527800000009';

interface Bank {
  code: string;
  name: string;
}

// Special cases for secondary institutions
const SECONDARY_INSTITUTIONS: { [key: string]: string } = {
  "002": "91802", // BANAMEX2
  "012": "91812", // BBVA BANCOMER2
  "014": "91814", // SANTANDER2
  "021": "91821", // HSBC2
  "072": "91872", // BANORTE2
  "127": "91927", // AZTECA2
};

const getInstitutionCode = (bankCode: string) => {
  const primaryCode = BANK_TO_INSTITUTION[bankCode];
  if (primaryCode) return primaryCode;
  
  const secondaryCode = SECONDARY_INSTITUTIONS[bankCode];
  if (secondaryCode) return secondaryCode;
  
  return "90646";
};

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
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    // Pre-fill refs array
    inputRefs.current = inputRefs.current.slice(0, cellCount);
  }, [cellCount]);

  const handleCellFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleKeyPress = (index: number, keyValue: string) => {
    if (keyValue === '' && index > 0) {
      // Handle backspace
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChange(newValue);
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (!/^\d*$/.test(keyValue)) return; // Only allow numbers

    const newValue = value.substring(0, index) + keyValue + value.substring(index + 1);
    onChange(newValue);
    
    if (index < cellCount - 1 && keyValue !== '') {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <View style={otpStyles.container}>
      {Array(cellCount).fill(0).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => inputRefs.current[index] = ref}
          style={[
            otpStyles.cell,
            focusedIndex === index && otpStyles.focusedCell,
            value[index] && otpStyles.filledCell
          ]}
          keyboardType="number-pad"
          maxLength={1}
          onFocus={() => handleCellFocus(index)}
          onChangeText={(text) => handleKeyPress(index, text)}
          value={value[index] || ''}
          selectionColor={colors.black}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
};

// Add this formatter function after the imports and before the component
const formatNumber = (num: number | string) => {
  return Number(num).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export default function ConfirmDepositScreen() {
  const { 
    amount, 
    recipientId,
    recipientName, 
    accountNumber,
    bankCode,
    bankName,
    institutionCode,
    accountType
  } = useLocalSearchParams<{
    amount: string;
    recipientId: string;
    recipientName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    institutionCode: string;
    accountType: string;
  }>();

  const [concept, setConcept] = useState('');
  const [concept2, setConcept2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userCommission, setUserCommission] = useState(5.80); // Default fallback
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [clipboardCode, setClipboardCode] = useState('');
  
  // Bottom sheet reference
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    async function fetchUserCommission() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) return;
        const userData = await db.users.get(currentUser.id);
        setUserCommission(userData?.outbound_commission_fixed ?? 5.80);
      } catch (err) {
        console.error("Error fetching user commission:", err);
      }
    }
    fetchUserCommission();
  }, []);

  useEffect(() => {
    const checkClipboard = async () => {
      const text = await Clipboard.getStringAsync();
      if (text && text.length === 6 && /^\d+$/.test(text)) {
        setClipboardCode(text);
      }
    };
    checkClipboard();
  }, [showMfaModal]);

  // Update commission logic to use dynamic user commission
  const isInternalTransfer = accountNumber?.startsWith('6461805278');
  const appliedCommission = isInternalTransfer ? 0 : userCommission;
  const totalAmount = Number(amount) + appliedCommission;

  const handlePasteCode = async () => {
    if (clipboardCode) {
      setMfaCode(clipboardCode);
    }
  };

  const handleConfirm = async () => {
    if (!concept || concept.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El concepto es obligatorio',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    setShowMfaModal(true);
  };

  const handleMfaConfirm = async () => {
    if (mfaCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El código debe tener 6 dígitos',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      if (!currentUser?.id) throw new Error('No authenticated user');

      // First verify MFA
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const factor = factorsData?.totp?.[0];

      if (!factor) throw new Error('MFA no configurado');

      // Challenge the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factor.id
      });

      if (challengeError) throw challengeError;

      // Verify the challenge
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challengeData.id,
        code: mfaCode
      });

      if (verifyError) throw verifyError;

      // If MFA verification successful, proceed with transfer
      const finalInstitutionCode = getInstitutionCode(bankCode);

      const formData = new FormData();
      formData.append('userId', currentUser.id);
      formData.append('amount', amount);
      formData.append('accountType', accountType);
      formData.append(accountNumber.length === 16 ? 'tarjeta' : 'clabe', accountNumber);
      formData.append('concept', concept);
      if (concept2) formData.append('concept2', concept2);
      formData.append('beneficiaryName', recipientName);

      if (accountType === 'tarjeta') {
        formData.append('institucionContraparte', finalInstitutionCode);
      }

      const result = await createTransfer(formData);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Transferencia completada',
          text2: result.message || 'La transferencia se ha realizado correctamente',
          position: 'bottom',
          visibilityTime: 3000,
        });

        router.replace({
          pathname: '/(tabs)/deposit/processing',
          params: {
            movementData: JSON.stringify({
              clave_rastreo: result.clave_rastreo,
              amount,
              commission: appliedCommission,
              finalAmount: amount + appliedCommission,
              recipientName,
              beneficiaryName: recipientName,
              bankName: bankName,
              counterpartyClabe: accountNumber,
              counterpartyBank: bankName,
              concept,
              concept2,
              status: 'COMPLETED',
              createdAt: new Date().toISOString(),
              direction: 'OUTBOUND'
            })
          }
        });
      } else {
        throw new Error(result.error || 'Error en la transferencia');
      }
    } catch (error) {
      console.error('Error in transfer:', error);
      Toast.show({
        type: 'error',
        text1: 'Error en la transferencia',
        text2: error instanceof Error ? error.message : 'Por favor intenta de nuevo más tarde',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
      setShowMfaModal(false);
    }
  };

  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Confirmar depósito</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amount}>{formatNumber(amount)}</Text>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.label}>Monto:</Text>
            <Text style={styles.value}>${formatNumber(amount)}</Text>

            {/* Only show commission if not internal transfer */}
            {!isInternalTransfer && (
              <>
                <Text style={styles.label}>Comisión:</Text>
                <Text style={styles.value}>${formatNumber(userCommission)}</Text>
              </>
            )}

            <Text style={styles.label}>Total:</Text>
            <Text style={styles.totalValue}>${formatNumber(totalAmount)}</Text>
          </View>

          <View style={styles.recipientCard}>
            <Text style={styles.label}>Destinatario</Text>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.accountNumber}>{accountNumber}</Text>
          </View>

          <View style={styles.conceptContainer}>
            <Text style={styles.label}>Concepto</Text>
            <TextInput
              style={styles.conceptInput}
              placeholder="Agregar concepto"
              value={concept}
              onChangeText={setConcept}
              placeholderTextColor={colors.darkGray}
            />
          </View>

          <View style={styles.conceptContainer}>
            <Text style={styles.label}>Concepto 2 (opcional)</Text>
            <TextInput
              style={styles.conceptInput}
              placeholder="Agregar concepto adicional"
              value={concept2}
              onChangeText={setConcept2}
              placeholderTextColor={colors.darkGray}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.confirmButton,
              isLoading && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            <Text style={styles.confirmButtonText}>
              {isLoading ? 'Procesando...' : 'Confirmar transferencia'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal
        visible={showMfaModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMfaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar transferencia</Text>
              <TouchableOpacity 
                onPress={() => setShowMfaModal(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>
                Ingresa el código de verificación de 6 dígitos de tu aplicación de autenticación
              </Text>
              
              <OTPInput 
                value={mfaCode} 
                onChange={setMfaCode}
              />

              {clipboardCode && (
                <TouchableOpacity 
                  style={styles.pasteButton}
                  onPress={handlePasteCode}
                >
                  <Feather name="clipboard" size={20} color={colors.black} />
                  <Text style={styles.pasteButtonText}>Pegar código</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  (mfaCode.length !== 6 || isLoading) && styles.buttonDisabled
                ]}
                onPress={handleMfaConfirm}
                disabled={mfaCode.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          ),
          success: (props) => (
            <View style={toastStyles.container}>
              <View style={[toastStyles.iconContainer, { backgroundColor: colors.black }]}>
                <Feather name="check" size={24} color={colors.white} />
              </View>
              <View style={toastStyles.textContainer}>
                <Text style={toastStyles.title}>{props.text1}</Text>
                <Text style={toastStyles.message}>{props.text2}</Text>
              </View>
            </View>
          )
        }}
      />
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
    backgroundColor: colors.white,
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
    padding: 24,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  currencySymbol: {
    fontFamily: 'ClashDisplay',
    fontSize: 56,
    color: colors.black,
    marginRight: 8,
  },
  amount: {
    fontFamily: 'ClashDisplay',
    fontSize: 56,
    color: colors.black,
  },
  recipientCard: {
    backgroundColor: colors.beige,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  recipientName: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 16,
    color: colors.darkGray,
  },
  conceptContainer: {
    marginBottom: 32,
  },
  conceptInput: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
    paddingVertical: 8,
  },
  confirmButton: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto', // Pushes button to bottom
  },
  confirmButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
  },
  detailsCard: {
    backgroundColor: colors.beige,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  value: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 8,
  },
  totalValue: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    color: colors.black,
    fontWeight: 'bold',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
  },
  bottomSheetHandle: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bottomSheetIndicator: {
    backgroundColor: colors.lightGray,
    width: 40,
  },
  bottomSheetContent: {
    padding: 24,
  },
  bottomSheetTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
    color: colors.black,
    marginBottom: 12,
  },
  bottomSheetMessage: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 24,
  },
  bottomSheetButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.lightGray,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 24,
    backgroundColor: colors.beige,
    borderRadius: 8,
  },
  pasteButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.black,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
  },
  modalTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 22,
    color: colors.black,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.beige,
  },
  modalBody: {
    padding: 24,
  },
  modalMessage: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
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

const otpStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  cell: {
    width: 48,
    height: 56,
    fontSize: 24,
    borderWidth: 1.5,
    borderColor: colors.beige,
    borderRadius: 12,
    textAlign: 'center',
    fontFamily: 'ClashDisplay',
    color: colors.black,
    backgroundColor: colors.white,
    paddingVertical: 8,
  },
  focusedCell: {
    borderColor: colors.black,
    borderWidth: 2,
    backgroundColor: colors.beige,
  },
  filledCell: {
    backgroundColor: colors.beige,
  },
});
