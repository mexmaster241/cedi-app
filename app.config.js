import 'dotenv/config';

export default {
  expo: {
    // ... other config
    plugins: [
      "expo-secure-store"
    ],
    extra: {
      speiApiUrl: process.env.SPEI_API_URL,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      eas: {
        projectId: "90a7579b-5a8d-4191-8bba-bc4f00537579"
      }
    }
  }
};