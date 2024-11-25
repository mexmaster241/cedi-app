import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/app/constants/colors';

// Mock data for recipients
const mockRecipients = [
  { id: '1', name: 'Juan Pérez', accountNumber: '****1234' },
  { id: '2', name: 'María García', accountNumber: '****5678' },
  { id: '3', name: 'Carlos López', accountNumber: '****9012' },
];

export default function SelectRecipientScreen() {
  const { amount } = useLocalSearchParams<{ amount: string }>();

  const handleRecipientSelect = (recipient: typeof mockRecipients[0]) => {
    router.push({
      pathname: '/deposit/confirm',
      params: {
        amount,
        recipientName: recipient.name,
        accountNumber: recipient.accountNumber,
      },
    });
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
          <Text style={styles.title}>Seleccionar destinatario</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.newRecipientButton}>
            <View style={styles.iconContainer}>
              <Feather name="plus" size={24} color={colors.black} />
            </View>
            <Text style={styles.newRecipientText}>Nuevo destinatario</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Recientes</Text>

          <FlatList
            data={mockRecipients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.recipientItem}
                onPress={() => handleRecipientSelect(item)}
              >
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{item.name}</Text>
                  <Text style={styles.accountNumber}>{item.accountNumber}</Text>
                </View>
                <Feather name="chevron-right" size={24} color={colors.lightGray} />
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
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
});