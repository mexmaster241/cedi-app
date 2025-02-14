import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  RefreshControl 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/app/constants/colors';
import { getCurrentUser, db } from '@/app/src/db';
import { Skeleton } from '@/app/components/Skeleton';

interface UserProfile {
  full_name: string;
  email: string;
  company: string;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const userData = await db.users.getByEmail(currentUser.email!);
        setUserProfile({
          full_name: userData.given_name + ' ' + userData.family_name || 'Usuario',
          email: userData.email || currentUser.email!,
          company: userData.company_name || 'Empresa no especificada'
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
});
