export function buildWhatsAppUrl({ phone, text }) {
  const cleanPhone = String(phone || "").replace(/[^0-9]/g, "")
  if (!cleanPhone) {
    // Mantener compatibilidad: si no hay número, devolvemos una URL inválida controlada.
    return `https://wa.me/?text=${encodeURIComponent(text || "")}`
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text || "")}`
}

export function sanitizeQuantity(quantity) {
  const n = Number(quantity)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1
}

