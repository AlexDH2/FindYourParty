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

/**
 * Genera un código de reserva legible y amigable a partir del ID de Supabase.
 * Ejemplo: e6688ff0-4204-4c98-a67e-7085799e5fe0 -> #FYP-E6688FF0
 */
export function formatReservationCode(id) {
  if (!id) return "#FYP-PROMO";
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `#FYP-${clean.slice(0, 8)}`;
}

/**
 * Genera el mensaje estructurado de WhatsApp para reservar o solicitar pases.
 * Mantiene intactos todos los datos: Evento, Entrada, Etapa, Precio, Cantidad, Total y Código.
 */
export function generateReservationMessage({ event, selectedTicket, quantity, rpcData }) {
  const isFree = Number(selectedTicket?.price) === 0;
  const ticketName = rpcData?.ticket_type || selectedTicket?.name || "General";
  const stageName = rpcData?.ticket_stage || selectedTicket?.stageName || "";
  const unitPrice = Number(rpcData?.unit_price ?? selectedTicket?.price ?? 0);
  const totalNum = isFree ? 0 : Number(rpcData?.total ?? (unitPrice * quantity));
  const reservationId = rpcData?.id;
  const reservationCode = formatReservationCode(reservationId);

  const unitPriceStr = isFree ? "S/ 0.00 (Gratis)" : `S/ ${unitPrice.toFixed(2)}`;
  const totalStr = isFree ? "S/ 0.00 (Pase Libre)" : `S/ ${totalNum.toFixed(2)}`;

  if (isFree) {
    return (
      `🎉 *¡HOLA FYP! Quiero mi Pase Libre para:* \n` +
      `🔥 *${event?.title || "EL EVENTO"}*\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *DETALLE DEL REGISTRO:*\n` +
      `🎟️ *Zona:* ${ticketName}\n` +
      (stageName ? `⚡ *Etapa / Oferta:* ${stageName}\n` : "") +
      `👤 *Pases:* ${quantity} ${quantity === 1 ? "entrada" : "entradas"}\n` +
      `💵 *Total:* ${totalStr}\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `🔖 *CÓDIGO DE RESERVA:*\n` +
      `👉 \`${reservationCode}\` (ID: ${reservationId || "directo"})\n\n` +
      `📲 ¿Me confirmas mi registro en lista para el ingreso, por favor? ¡Gracias!`
    );
  }

  return (
    `🎉 *¡HOLA FYP! Quiero asegurar mi entrada para:* \n` +
    `🔥 *${event?.title || "EL EVENTO"}*\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *DETALLE DEL PEDIDO:*\n` +
    `🎟️ *Zona:* ${ticketName}\n` +
    (stageName ? `⚡ *Etapa / Oferta:* ${stageName}\n` : "") +
    `👤 *Pases:* ${quantity} ${quantity === 1 ? "entrada" : "entradas"}\n` +
    `💰 *Precio unitario:* ${unitPriceStr}\n` +
    `💳 *Total a pagar:* ${totalStr}\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `🔖 *CÓDIGO DE RESERVA:*\n` +
    `👉 \`${reservationCode}\` (ID: ${reservationId || "directo"})\n\n` +
    `📲 Por favor envíame los datos para confirmar mi reserva al toque (Yape / Plin / Transferencia).`
  );
}

