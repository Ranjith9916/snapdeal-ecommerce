import { supabase } from '../lib/supabase';

export interface ProfileModel {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  points: number;
  notification_settings: Record<string, boolean>;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as ProfileModel;
}

export async function updateProfile(userId: string, updates: Partial<ProfileModel>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
  return { success: true };
}
