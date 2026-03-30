import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';

/** Handles auth-based redirects. Must be inside AuthProvider. */
export function AuthRouter() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = !!session?.user;

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/intro');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [loading, isAuthenticated, segments, router]);

  return null;
}
