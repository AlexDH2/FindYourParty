import { supabase } from '../lib/supabase';

export const supabaseService = {
  getClient() {
    return supabase;
  },
};
