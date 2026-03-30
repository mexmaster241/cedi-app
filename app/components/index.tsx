import * as authService from '@/app/services/auth';

const handleUnenrollMFA = async (factorId: string) => {
  try {
    await authService.unenrollMfaFactor(factorId);
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
}; 