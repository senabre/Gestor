import { supabase, handleSupabaseQuery } from './supabase';
import { UserSettings, defaultSettings } from '../types/settings';

export async function loadUserSettings(userId: string): Promise<UserSettings> {
  try {
    const data = await handleSupabaseQuery(
      () => supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', userId)
        .maybeSingle(),
      {
        maxRetries: 3,
        allowEmpty: true,
        errorMessage: 'Failed to load settings'
      }
    );

    // Return merged settings to ensure all fields exist
    return {
      ...defaultSettings,
      ...(data?.settings || {})
    };
  } catch (error) {
    console.error('Error loading user settings:', error);
    return defaultSettings;
  }
}

export async function saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
  try {
    // First try to update existing settings
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({ 
        settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    // If no row was updated, insert new settings
    if (updateError?.code === 'PGRST116') {
      await handleSupabaseQuery(
        () => supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            settings,
            updated_at: new Date().toISOString()
          }),
        {
          maxRetries: 3,
          errorMessage: 'Failed to save settings'
        }
      );
    } else if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw new Error('Failed to save settings');
  }
}