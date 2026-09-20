import imageCompression from "browser-image-compression";

/**
 * Comprime una imagen para subir a Supabase Storage.
 * - Flyers/portadas: objetivo 400 KB, máximo 500 KB.
 * - Croquis/mapas: permite hasta 600 KB si es necesario para legibilidad.
 * @param {File} file - Archivo de imagen original.
 * @param {object} [opts] - Opciones opcionales.
 * @param {boolean} [opts.isMap] - Si es true, permite hasta 600 KB.
 * @returns {Promise<File>} Archivo comprimido.
 */
export async function compressImage(file, opts = {}) {
  const maxSizeMB = opts.isMap ? 0.6 : 0.5; // 500 KB o 600 KB
  const targetSizeMB = opts.isMap ? 0.5 : 0.4; // 400 KB o 500 KB objetivo

  // Si el archivo ya es menor al objetivo, no comprimir
  if (file.size <= targetSizeMB * 1024 * 1024) {
    return file;
  }

  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: supportsWebP() ? "image/webp" : file.type,
    initialQuality: 0.85,
  };

  try {
    const compressed = await imageCompression(file, options);

    // Cambiar extensión si se convirtió a WebP
    if (supportsWebP() && !compressed.name.endsWith(".webp")) {
      const newName = compressed.name.replace(/\.[^.]+$/, ".webp");
      return new File([compressed], newName, { type: "image/webp" });
    }

    return compressed;
  } catch (error) {
    console.error("Error al comprimir imagen:", error);
    return file; // Devolver original si falla la compresión
  }
}

/** Detecta soporte de WebP en el navegador */
function supportsWebP() {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}
