import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/app/constants/colors';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

export default function NewRecipient() {
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  // Example bank list - replace with your actual bank list
  const banks = [
    { label: 'BBVA', value: 'bbva' },
    { label: 'Santander', value: 'santander' },
    { label: 'Banorte', value: 'banorte' },
    { label: 'HSBC', value: 'hsbc' },
  ];

  const handleSubmit = () => {
    // Handle the submission logic here
    console.log({ name, account, selectedBank });
    router.back();
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
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre del destinatario"
            />
          </View>

          {/* Account Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número de cuenta</Text>
            <TextInput
              style={styles.input}
              value={account}
              onChangeText={setAccount}
              placeholder="Ingresa el número de cuenta"
              keyboardType="numeric"
            />
          </View>

          {/* Bank Selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Banco</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedBank}
                onValueChange={(itemValue) => setSelectedBank(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona un banco" value="" />
                {banks.map((bank) => (
                  <Picker.Item 
                    key={bank.value} 
                    label={bank.label} 
                    value={bank.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Agregar Destinatario</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beige,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: colors.beige,
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
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: 'ClashDisplay',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'ClashDisplay',
  },
});