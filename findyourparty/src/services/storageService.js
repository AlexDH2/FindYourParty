import { supabase } from "../lib/supabase";

export const storageService = {
  async uploadImage({ bucket, file, fileName }) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false // No sobrescribir si ya existe
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error uploading image to Supabase Storage:", error);
      throw error;
    }
  },

  getPublicUrl({ bucket, fileName }) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
};