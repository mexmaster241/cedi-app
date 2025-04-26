import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/app/constants/colors';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/app/src/db';
import { db } from '@/app/src/db';
import Toast from 'react-native-toast-message';
import React from 'react';
import { BANK_CODES, BANK_TO_INSTITUTION } from '@/app/constants/banks';
import { createContact } from '@/app/constants/contacts';

type AccountType = 'clabe' | 'tarjeta';

export default function NewRecipient() {
  const params = useLocalSearchParams<{ amount: string, commission: string }>();
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [alias, setAlias] = useState('');
  const [detectedBank, setDetectedBank] = useState<{ code: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('clabe');
  const [showBankModal, setShowBankModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // For web fallback
  const isWeb = Platform.OS === 'web';

  const handleAccountChange = (text: string) => {
    // Remove any spaces or special characters
    const cleanedText = text.replace(/\D/g, '');
    setAccount(cleanedText);

    if (accountType === 'clabe' && cleanedText.length >= 3) {
      const bankCode = cleanedText.substring(0, 3);
      const bank = BANK_CODES[bankCode as keyof typeof BANK_CODES];
      
      setDetectedBank(bank ? {
        code: bank.code,
        name: bank.name
      } : null);
      
      if (bank) {
        setSelectedBank(bank.code);
      }
    } else if (accountType === 'tarjeta') {
      setDetectedBank(null);
    }
  };

  const validateForm = () => {
    if (!name) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El nombre es requerido',
        position: 'bottom',
      });
      return false;
    }

    if (!account) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El número de cuenta es requerido',
        position: 'bottom',
      });
      return false;
    }

    if (accountType === 'clabe' && account.length !== 18) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'La CLABE debe tener 18 dígitos',
        position: 'bottom',
      });
      return false;
    }

    if (accountType === 'tarjeta') {
      if (account.length !== 16) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'La tarjeta debe tener 16 dígitos',
          position: 'bottom',
        });
        return false;
      }

      if (!selectedBank) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Debes seleccionar un banco para la tarjeta',
          position: 'bottom',
        });
        return false;
      }
    }

    return true;
  };

  const handleShowConfirmation = () => {
    if (!validateForm()) return;
    setShowConfirmation(true);
  };
  
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.id) throw new Error('No user authenticated');

      const bankCode = accountType === 'clabe' ? account.substring(0, 3) : selectedBank;
      const bankName = BANK_CODES[bankCode]?.name || 'Unknown Bank';
      const institutionCode = BANK_TO_INSTITUTION[bankCode] || '90646';

      const result = await createContact({
        name: name,
        bank: bankName,
        clabe: accountType === 'clabe' ? account : undefined,
        card: accountType === 'tarjeta' ? account : undefined,
        alias: alias || name,
        userId: currentUser.id
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Error creating contact');
      }

      router.push({
        pathname: '/(tabs)/deposit/confirm',
        params: {
          recipientId: result.data.id,
          recipientName: result.data.name,
          accountNumber: account,
          amount: params.amount,
          bankCode,
          bankName,
          institutionCode,
          accountType
        }
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo guardar el contacto',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

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
          <Text style={styles.title}>Nuevo Destinatario</Text>
        </View>

        <View style={styles.content}>
          {/* Account Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                accountType === 'clabe' && styles.toggleButtonActive
              ]}
              onPress={() => {
                setAccountType('clabe');
                setAccount('');
                setSelectedBank('');
              }}
            >
              <Text style={[
                styles.toggleButtonText,
                accountType === 'clabe' && styles.toggleButtonTextActive
              ]}>CLABE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                accountType === 'tarjeta' && styles.toggleButtonActive
              ]}
              onPress={() => {
                setAccountType('tarjeta');
                setAccount('');
                setSelectedBank('');
                setDetectedBank(null);
              }}
            >
              <Text style={[
                styles.toggleButtonText,
                accountType === 'tarjeta' && styles.toggleButtonTextActive
              ]}>Tarjeta</Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre del destinatario"
              placeholderTextColor={colors.darkGray}
            />
          </View>

          {/* Account Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{accountType === 'clabe' ? 'CLABE' : 'Número de Tarjeta'}</Text>
            <TextInput
              style={styles.input}
              value={account}
              onChangeText={handleAccountChange}
              placeholder={accountType === 'clabe' ? "18 dígitos" : "16 dígitos"}
              keyboardType="numeric"
              maxLength={accountType === 'clabe' ? 18 : 16}
              placeholderTextColor={colors.darkGray}
            />
            {accountType === 'clabe' && detectedBank && (
              <Text style={styles.bankDetected}>
                Banco detectado: {detectedBank.name}
              </Text>
            )}
          </View>

          {/* Bank Selector - Only show for card type */}
          {accountType === 'tarjeta' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Banco</Text>
              <TouchableOpacity
                style={[styles.input, styles.pickerButton]}
                onPress={() => setShowBankModal(true)}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !selectedBank && { color: colors.darkGray }
                ]}>
                  {selectedBank ? BANK_CODES[selectedBank]?.name : 'Selecciona un banco'}
                </Text>
                <Feather name="chevron-down" size={20} color={colors.darkGray} />
              </TouchableOpacity>
              {selectedBank && detectedBank && (
                <Text style={styles.bankDetected}>
                  Banco seleccionado: {detectedBank.name} ({BANK_TO_INSTITUTION[selectedBank] || 'N/A'})
                </Text>
              )}

              <Modal
                visible={showBankModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowBankModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Selecciona un banco</Text>
                      <TouchableOpacity
                        onPress={() => setShowBankModal(false)}
                        style={styles.modalCloseButton}
                      >
                        <Feather name="x" size={24} color={colors.black} />
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.bankList}>
                      {Object.entries(BANK_CODES)
                        .filter(([code]) => {
                          const institutionCode = BANK_TO_INSTITUTION[code];
                          return institutionCode && institutionCode.startsWith('4'); // Only show banks that can receive card payments
                        })
                        .sort((a, b) => a[1].name.localeCompare(b[1].name))
                        .map(([code, bank]) => (
                          <TouchableOpacity
                            key={code}
                            style={[
                              styles.bankOption,
                              selectedBank === code && styles.bankOptionSelected
                            ]}
                            onPress={() => {
                              setSelectedBank(code);
                              setDetectedBank({
                                code: bank.code,
                                name: bank.name
                              });
                              setShowBankModal(false);
                            }}
                          >
                            <Text style={[
                              styles.bankOptionText,
                              selectedBank === code && styles.bankOptionTextSelected
                            ]}>
                              {bank.name} ({BANK_TO_INSTITUTION[code]})
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </View>
          )}

          {/* Alias Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Alias (opcional)</Text>
            <TextInput
              style={styles.input}
              value={alias}
              onChangeText={setAlias}
              placeholder="Ej: Mamá, Trabajo, etc."
              placeholderTextColor={colors.darkGray}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled
            ]}
            onPress={handleShowConfirmation}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Guardando...' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmation}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelConfirmation}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.confirmationModal]}>
              <Text style={styles.bottomSheetTitle}>
                Guardar contacto
              </Text>
              <Text style={styles.bottomSheetMessage}>
                ¿Estás seguro que deseas guardar este contacto?
              </Text>
              <View style={styles.bottomSheetActions}>
                <TouchableOpacity 
                  style={[styles.bottomSheetButton, styles.cancelButton]} 
                  onPress={handleCancelConfirmation}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.bottomSheetButton, styles.confirmButton]} 
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
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
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.beige,
    borderRadius: 10,
    marginBottom: 20,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: colors.white,
  },
  toggleButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
  },
  toggleButtonTextActive: {
    color: colors.black,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'ClashDisplay',
    marginBottom: 8,
    color: colors.black,
  },
  input: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: 'ClashDisplay',
    borderWidth: 1,
    borderColor: colors.beige,
    color: colors.black,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15,
  },
  pickerButtonText: {
    fontSize: 16,
    fontFamily: 'ClashDisplay',
    color: colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  confirmationModal: {
    padding: 24,
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
    fontSize: 18,
    fontFamily: 'ClashDisplay',
    color: colors.black,
  },
  modalCloseButton: {
    padding: 5,
  },
  bankList: {
    padding: 10,
    maxHeight: '80%',
  },
  bankOption: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  bankOptionSelected: {
    backgroundColor: colors.beige,
  },
  bankOptionText: {
    fontSize: 16,
    fontFamily: 'ClashDisplay',
    color: colors.black,
  },
  bankOptionTextSelected: {
    color: colors.black,
  },
  submitButton: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'ClashDisplay',
  },
  bankDetected: {
    marginTop: 4,
    fontSize: 14,
    color: colors.darkGray,
    fontFamily: 'ClashDisplay',
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
  bottomSheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomSheetButton: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.beige,
    marginRight: 8,
  },
  cancelButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
  },
  confirmButton: {
    backgroundColor: colors.black,
    marginLeft: 8,
  },
  confirmButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
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