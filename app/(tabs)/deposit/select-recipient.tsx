import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/app/constants/colors';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCurrentUser } from '@/app/src/db';
import { db } from '@/app/src/db';
import { Skeleton } from '@/app/components/Skeleton';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { deleteContact } from '@/app/constants/contacts';
import { BANK_CODES, BANK_TO_INSTITUTION } from '@/app/constants/banks';
import BottomSheet from '@gorhom/bottom-sheet';
import Portal from '@gorhom/bottom-sheet';

interface Contact {
  id: string;
  name: string;
  alias?: string;
  clabe?: string;
  card?: string;
  phone?: string;
  bank?: string;
}

const getAccountPreview = (contact: Contact) => {
  if (contact.clabe) return `CLABE: ****${contact.clabe.slice(-4)}`;
  if (contact.card) return `Tarjeta: ****${contact.card.slice(-4)}`;
  if (contact.phone) return `Cel: ****${contact.phone.slice(-4)}`;
  return '';
};

interface ContactItemProps {
  contact: Contact;
  onSelect: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ contact, onSelect, onDelete }) => {
  return (
    <View style={styles.recipientItem}>
      <TouchableOpacity 
        style={styles.recipientContent}
        onPress={() => onSelect(contact)}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {(contact.alias || contact.name).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>
            {contact.alias || contact.name}
          </Text>
          <Text style={styles.accountNumber}>
            {getAccountPreview(contact)}
          </Text>
        </View>
        <Feather name="chevron-right" size={24} color={colors.lightGray} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteIconButton}
        onPress={() => {
          onDelete(contact);
        }}
        activeOpacity={0.6}
      >
        <Feather name="trash-2" size={22} color={colors.red} />
      </TouchableOpacity>
    </View>
  );
};

export default function SelectRecipientScreen() {
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCommission, setUserCommission] = useState(5.80); // Default fallback
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(-1);
  
  // Bottom sheet reference
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['30%'], []);

  // Inside the component, add this for a web fallback
  const isWeb = Platform.OS === 'web';

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      const userEmail = currentUser?.email;
      
      if (!userEmail) {
        throw new Error('No email found for user');
      }

      // Get user ID first
      const userId = await db.users.getUserId(userEmail);
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Fetch contacts using userId
      const userContacts = await db.contacts.list(userId);
      setContacts(userContacts as Contact[]);
    } catch (err) {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      if (isMounted) {
        await fetchContacts();
        await fetchUserCommission();
      }
    }

    // Add useEffect to fetch user's commission
    async function fetchUserCommission() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) return;

        const userData = await db.users.get(currentUser.id);
        // Get outbound commission from user data
        setUserCommission(userData?.outbound_commission_fixed ?? 5.80);
      } catch (err) {
        // Error handled silently
      }
    }

    initialize();
    return () => { isMounted = false; };
  }, []);

  const handleDeleteContact = async (contactId: string) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('No authenticated user');
      }

      const result = await deleteContact(contactId, currentUser.id);
      
      if (result.success) {
        // Refresh contacts after deletion
        await fetchContacts();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      // Close the bottom sheet
      bottomSheetRef.current?.close();
      setContactToDelete(null);
    }
  };

  const handleShowDeleteConfirmation = useCallback((contact: Contact) => {
    setContactToDelete(contact);
    setBottomSheetVisible(0); // Show the sheet by setting index to 0
  }, []);

  const handleCancelDelete = useCallback(() => {
    setBottomSheetVisible(-1); // Hide the sheet
    setContactToDelete(null);
  }, []);

  const handleRecipientSelect = (contact: Contact) => {
    // Determine account type and bank info
    const accountType = contact.clabe ? 'clabe' : contact.card ? 'tarjeta' : 'phone';
    let bankCode, bankName, institutionCode;

    if (accountType === 'clabe' && contact.clabe) {
      // For CLABE, get bank from first 3 digits
      bankCode = contact.clabe.substring(0, 3);
      bankName = BANK_CODES[bankCode]?.name || 'Unknown Bank';
      institutionCode = BANK_TO_INSTITUTION[bankCode] || '90646';
    } else if (accountType === 'tarjeta' && contact.card) {
      // For cards, we need to get the bank from the contact's bank field
      // You might need to reverse lookup the bank code from the bank name
      const bankEntry = Object.entries(BANK_CODES).find(([_, bank]) => bank.name === contact.bank);
      if (bankEntry) {
        bankCode = bankEntry[0];
        bankName = contact.bank;
        institutionCode = BANK_TO_INSTITUTION[bankCode] || '90646';
      }
    }

    router.push({
      pathname: '/deposit/confirm',
      params: {
        amount,
        recipientId: contact.id,
        recipientName: contact.name,
        accountNumber: contact.clabe || contact.card || contact.phone,
        accountType,
        bankCode,
        bankName,
        institutionCode
      },
    });
  };

  const handleNewRecipient = () => {
    router.push({
      pathname: '/deposit/new',
      params: { amount }
    });
  };

  const renderItem = ({ item }: { item: Contact }) => (
    <ContactItem
      contact={item}
      onSelect={handleRecipientSelect}
      onDelete={handleShowDeleteConfirmation}
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Seleccionar destinatario</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.newRecipientButton}
            onPress={handleNewRecipient}
          >
            <View style={styles.iconContainer}>
              <Feather name="plus" size={24} color={colors.black} />
            </View>
            <Text style={styles.newRecipientText}>Nuevo destinatario</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Contactos guardados</Text>

          {isLoading ? (
            [...Array(3)].map((_, index) => (
              <View key={index} style={styles.recipientItem}>
                <View style={styles.avatarContainer}>
                  <Skeleton width={40} height={40} />
                </View>
                <View style={styles.recipientInfo}>
                  <Skeleton width={150} height={20} />
                  <View style={{ marginTop: 4 }}>
                    <Skeleton width={100} height={16} />
                  </View>
                </View>
              </View>
            ))
          ) : contacts.length > 0 ? (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          ) : (
            <Text style={styles.emptyText}>
              No hay contactos guardados
            </Text>
          )}
        </View>

        {/* Portal for bottom sheet (helps with web rendering) */}
        <Portal>
          <BottomSheet
            ref={bottomSheetRef}
            index={bottomSheetVisible}
            snapPoints={snapPoints}
            enablePanDownToClose
            handleStyle={styles.bottomSheetHandle}
            handleIndicatorStyle={styles.bottomSheetIndicator}
            backgroundStyle={styles.bottomSheetBackground}
            onChange={(index) => {
              if (index === -1) {
                setContactToDelete(null);
              }
              setBottomSheetVisible(index);
            }}
          >
            <View style={styles.bottomSheetContent}>
              <Text style={styles.bottomSheetTitle}>
                Eliminar contacto
              </Text>
              <Text style={styles.bottomSheetMessage}>
                ¿Estás seguro que deseas eliminar este contacto?
              </Text>
              <View style={styles.bottomSheetActions}>
                <TouchableOpacity 
                  style={[styles.bottomSheetButton, styles.cancelButton]} 
                  onPress={handleCancelDelete}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.bottomSheetButton, styles.deleteConfirmButton]} 
                  onPress={() => {
                    contactToDelete && handleDeleteContact(contactToDelete.id);
                  }}
                >
                  <Text style={styles.deleteConfirmButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheet>
        </Portal>

        {/* Then in the return statement, add a conditional rendering for web */}
        {isWeb && contactToDelete && (
          <View style={styles.webModalOverlay}>
            <View style={styles.webModalContent}>
              <Text style={styles.bottomSheetTitle}>
                Eliminar contacto
              </Text>
              <Text style={styles.bottomSheetMessage}>
                ¿Estás seguro que deseas eliminar este contacto?
              </Text>
              <View style={styles.bottomSheetActions}>
                <TouchableOpacity 
                  style={[styles.bottomSheetButton, styles.cancelButton]} 
                  onPress={handleCancelDelete}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.bottomSheetButton, styles.deleteConfirmButton]} 
                  onPress={() => contactToDelete && handleDeleteContact(contactToDelete.id)}
                >
                  <Text style={styles.deleteConfirmButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
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
  newRecipientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.beige,
    borderRadius: 12,
    marginBottom: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  newRecipientText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
  },
  sectionTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 16,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
    backgroundColor: colors.white,
  },
  recipientContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.beige,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    color: colors.black,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: colors.darkGray,
  },
  deleteIconButton: {
    padding: 15,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 24,
  },
  // Bottom Sheet Styles
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
  deleteConfirmButton: {
    backgroundColor: colors.red,
    marginLeft: 8,
  },
  deleteConfirmButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
  },
  // And add these styles for the web modal
  webModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webModalContent: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});