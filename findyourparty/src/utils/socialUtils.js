/**
 * Extrae el nombre de usuario (@handle) a partir de una URL o texto ingresado.
 * @param {string} input - URL o usuario (ej: https://instagram.com/euphoria_club/ o @euphoria_club)
 * @param {'instagram'|'tiktok'} platform
 * @returns {string} Handle con @ (ej: @euphoria_club) o ""
 */
export function extractSocialHandle(input, platform = "instagram") {
  if (!input || typeof input !== "string") return ""
  const clean = input.trim()
  if (!clean) return ""

  if (platform === "instagram") {
    // Si viene como URL completa de Instagram
    if (clean.includes("instagram.com/")) {
      const path = clean.split("instagram.com/")[1]
      const handle = path?.split(/[/?#]/)[0]
      if (handle && handle !== "p" && handle !== "reel" && handle !== "stories") {
        return `@${handle.replace(/^@/, "")}`
      }
    }
    // Si viene como @usuario o usuario
    const match = clean.match(/^@?([a-zA-Z0-9._]+)$/)
    if (match && match[1]) {
      return `@${match[1]}`
    }
    return clean.startsWith("@") ? clean : `@${clean}`
  }

  if (platform === "tiktok") {
    // Si viene como URL de TikTok
    if (clean.includes("tiktok.com/")) {
      const path = clean.split("tiktok.com/")[1]
      const segment = path?.split(/[/?#]/)[0]
      if (segment) {
        return `@${segment.replace(/^@/, "")}`
      }
    }
    // Si viene como @usuario o usuario
    const match = clean.match(/^@?([a-zA-Z0-9._]+)$/)
    if (match && match[1]) {
      return `@${match[1]}`
    }
    return clean.startsWith("@") ? clean : `@${clean}`
  }

  return clean
}

/**
 * Construye una URL completa y válida para abrir el perfil en la red social.
 * @param {string} input - Handle o URL
 * @param {'instagram'|'tiktok'} platform
 * @returns {string} URL completa
 */
export function buildSocialUrl(input, platform = "instagram") {
  if (!input || typeof input !== "string") return ""
  const clean = input.trim()
  if (!clean) return ""

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean
  }

  const rawHandle = clean.replace(/^@/, "")
  if (platform === "instagram") {
    return `https://instagram.com/${rawHandle}`
  }
  if (platform === "tiktok") {
    return `https://www.tiktok.com/@${rawHandle}`
  }

  return clean
}
