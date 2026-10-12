import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://lphorwwsrcdaocfszalf.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_nKua7H5TJJawvP97Qxzfag_un7PCA6E";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);