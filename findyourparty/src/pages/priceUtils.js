import { formatToYYYYMMDD } from "../utils/dateUtils"; // Assuming a date utility will be created or exists

/**
 * Represents a single stage of a ticket type.
 * @typedef {object} TicketStage
 * @property {string} name - Name of the stage (e.g., "Preventa 1").
 * @property {number} price - Price for this stage.
 * @property {string} start_date - Start date of the stage (YYYY-MM-DD).
 * @property {string} end_date - End date of the stage (YYYY-MM-DD).
 */

/**
 * Represents a ticket type with multiple stages.
 * @typedef {object} TicketTypeWithStages
 * @property {string} name - Name of the ticket type (e.g., "General").
 * @property {TicketStage[]} stages - Array of stages for this ticket type.
 */

/**
 * Transforms a legacy prices_json object (e.g., { general: "40", vip: "70" })
 * into the new conceptual structure with stages. This is a temporary measure
 * until the Admin form is updated to handle stages directly.
 * Placeholder dates are used.
 * @param {object} legacyPricesObject - The old prices_json object from Admin form.
 * @param {string} eventDate - The main event date (YYYY-MM-DD) to use as a base.
 * @returns {TicketTypeWithStages[]} The new conceptual prices_json structure.
 */
export function transformLegacyPricesJsonToNewFormat(legacyPricesObject, eventDate) {
  const newPrices = [];
  const today = formatToYYYYMMDD(new Date());

  for (const key in legacyPricesObject) {
    const priceValue = legacyPricesObject[key];
    if (priceValue !== null && priceValue !== undefined && priceValue !== "") {
      newPrices.push({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), // Capitalize and format name
        stages: [
          {
            name: "Venta Única", // Temporary stage name
            price: Number(String(priceValue).replace(/[^0-9.]/g, '')),
            start_date: today, // Start from today
            end_date: eventDate || "2099-12-31", // End on event date or far future
          },
        ],
      });
    }
  }
  return newPrices;
}

/**
 * Parses the prices_json string from Supabase into the conceptual array format.
 * Handles cases where it might still be the old object format or already the new array format.
 * @param {string|object|TicketTypeWithStages[]} pricesJson - The raw prices_json from Supabase.
 * @returns {TicketTypeWithStages[]} The parsed prices_json in the new conceptual structure.
 */
export function parseNewPricesJsonString(pricesJson) {
  if (!pricesJson) return [];

  let parsed = pricesJson;
  if (typeof pricesJson === 'string') {
    try {
      parsed = JSON.parse(pricesJson);
    } catch (e) {
      console.error("Error parsing prices_json string:", e);
      return [];
    }
  }

  // If it's still the old object format, transform it (e.g., { general: "40" })
  if (!Array.isArray(parsed) && typeof parsed === 'object') {
    // This case should ideally be handled by transformLegacyPricesJsonToNewFormat on save,
    // but this provides a fallback for existing data.
    return transformLegacyPricesJsonToNewFormat(parsed, formatToYYYYMMDD(new Date()));
  }

  return parsed;
}

/**
 * Determines the currently active price and stage for a given ticket type.
 * @param {TicketTypeWithStages} ticketType - A single ticket type object with stages.
 * @param {Date} [currentDate=new Date()] - The date to check against.
 * @returns {{price: number, stageName: string}|null} The active price and stage name, or null if no active stage.
 */
export function getActiveTicketStageAndPrice(ticketType, currentDate = new Date()) {
  if (!ticketType || !Array.isArray(ticketType.stages)) return null;

  const todayStr = formatToYYYYMMDD(currentDate);

  for (const stage of ticketType.stages) {
    const startDate = formatToYYYYMMDD(new Date(stage.start_date));
    const endDate = formatToYYYYMMDD(new Date(stage.end_date));

    if (todayStr >= startDate && todayStr <= endDate) {
      return { price: stage.price, stageName: stage.name };
    }
  }
  return null; // No active stage found
}

export function getMinActivePrice(allTicketTypesWithStages, currentDate = new Date()) {
  const activePrices = allTicketTypesWithStages
    .map(ticketType => getActiveTicketStageAndPrice(ticketType, currentDate))
    .filter(stage => stage !== null)
    .map(stage => stage.price);

  return activePrices.length > 0 ? Math.min(...activePrices) : 0;
}