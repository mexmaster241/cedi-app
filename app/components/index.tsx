import { supabase } from '../src/db';

const handleUnenrollMFA = async (factorId: string) => {
  try {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
}; 