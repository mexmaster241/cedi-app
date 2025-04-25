import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '@/app/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getCurrentUser } from '@/app/src/db';
import { db } from '@/app/src/db';
import { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import React from 'react';
import { Skeleton } from '@/app/components/Skeleton';

export default function Card() {
  const [clabe, setClabe] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClabe() {
      try {
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

        // Then get full user data using ID
        const user = await db.users.get(userId);
        if (!user) {
          console.error("User not found");
          setClabe("");
          return;
        }
        
        setClabe(user.clabe ?? "");
      } catch (err) {
        console.error("Error fetching CLABE:", err);
        setClabe("");
      } finally {
        setIsLoading(false);
      }
    }
    fetchClabe();
  }, []);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(clabe);
    Toast.show({
      type: 'success',
      text1: 'CLABE copiada',
      text2: 'La CLABE ha sido copiada al portapapeles',
      position: 'bottom',
      visibilityTime: 2000,
    });
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
          <Text style={styles.title}>Cuenta</Text>
        </View>

        <View style={styles.content}>
          {/* Card Information Section */}
          {/* <View style={styles.cardContainer}>
            <View style={styles.card}>
           
              <Text style={styles.cardNumber}>**** **** **** 1234</Text>
              <Text style={styles.cardHolder}>JOHN DOE</Text>
              <Text style={styles.expiry}>12/25</Text>
            </View>
          </View> */}

          {/* CLABE Section */}
          <View style={styles.clabeContainer}>
            <Text style={styles.clabeTitle}>CLABE</Text>
            <View style={styles.clabeBox}>
              {isLoading ? (
                <Skeleton width={200} height={24} />
              ) : (
                <Text style={styles.clabeNumber}>{clabe}</Text>
              )}
              <TouchableOpacity onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <Toast 
        config={{
          success: (props) => (
            <View style={toastStyles.container}>
              <View style={toastStyles.iconContainer}>
                <Feather name="check" size={24} color={colors.black} />
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
    backgroundColor: colors.beige,
  },
  content: {
    padding: 20,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 24,
  },
  card: {
    width: '100%',
    height: 200,
    backgroundColor: colors.black,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardNumber: {
    color: 'white',
    fontSize: 22,
    letterSpacing: 2,
    fontFamily: 'ClashDisplay',
  },
  cardHolder: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'ClashDisplay',
  },
  expiry: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'ClashDisplay',
  },
  clabeContainer: {
    marginTop: 20,
  },
  clabeTitle: {
    fontSize: 16,
    fontFamily: 'ClashDisplay',
    marginBottom: 10,
  },
  clabeBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clabeNumber: {
    fontSize: 18,
    fontFamily: 'ClashDisplay',
    letterSpacing: 1,
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