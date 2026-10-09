import { supabase } from '../lib/supabase';

export interface AddressModel {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  address_text: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export async function getUserAddresses(userId: string) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
  return data as AddressModel[];
}

export async function addAddress(userId: string, address: Omit<AddressModel, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('addresses')
    .insert({ user_id: userId, ...address })
    .select()
    .single();

  if (error) {
    console.error('Error adding address:', error);
    return { success: false, error };
  }
  return { success: true, data };
}

export async function updateAddress(addressId: string, address: Partial<Omit<AddressModel, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  const { error } = await supabase
    .from('addresses')
    .update(address)
    .eq('id', addressId);

  if (error) {
    console.error('Error updating address:', error);
    return { success: false, error };
  }
  return { success: true };
}

export async function deleteAddress(addressId: string) {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);

  if (error) {
    console.error('Error deleting address:', error);
    return { success: false, error };
  }
  return { success: true };
}
