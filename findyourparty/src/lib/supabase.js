import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  "https://lphorwwsrcdaocfszalf.supabase.co"

const supabaseKey =
  "sb_publishable_nKua7H5TJJawvP97Qxzfag_un7PCA6E"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)