import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with retries and better error handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: async (...args) => {
      const MAX_RETRIES = 3;
      let lastError;
      
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await fetch(...args);
        } catch (err) {
          lastError = err;
          console.error(`Attempt ${attempt} failed:`, err);
          
          if (attempt === MAX_RETRIES) {
            throw new Error('No se pudo conectar con el servidor después de varios intentos');
          }
          
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
      throw lastError;
    }
  }
});

// Helper function for handling Supabase queries with retries
export async function handleSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: { 
    maxRetries?: number;
    allowEmpty?: boolean;
    errorMessage?: string;
  } = {}
): Promise<T> {
  const { 
    maxRetries = 3,
    allowEmpty = false,
    errorMessage 
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await queryFn();
      
      if (error) throw error;
      if (!allowEmpty && !data) throw new Error('No se encontraron datos');
      
      return data as T;
    } catch (err: any) {
      lastError = err;
      console.error(`Attempt ${attempt} failed:`, err);
      
      if (attempt === maxRetries) {
        throw new Error(errorMessage || err.message || 'Error en la operación');
      }
      
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw lastError;
}