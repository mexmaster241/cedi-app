import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../constants/colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/src/db';
import { Skeleton } from './Skeleton';

export function Header() {
  const [fullName, setFullName] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        // Updated column names to match the database schema
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('given_name, family_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        // Construct full name from given_name and family_name
        const name = `${userProfile?.given_name || ''} ${userProfile?.family_name || ''}`.trim();
        setFullName(name || "Usuario");
      } catch (err) {
        console.error("Error fetching user data:", err);
        setFullName("Usuario");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <View style={styles.welcomeContainer}>
        <Text style={styles.greeting}>Bienvenido de nuevo</Text>
        {isLoading ? (
          <Skeleton width={150} height={28} />
        ) : (
          <Text style={styles.name}>{fullName}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  logo: {
    height: 200,
    width: 200,
  },
  welcomeContainer: {
    alignItems: 'center',
    gap: 4,
  },
  greeting: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.darkGray,
  },
  name: {
    fontFamily: 'ClashDisplay',
    fontSize: 24,
    color: colors.black,
  },
});