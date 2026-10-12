/**
 * Helper to ensure that the date is in YYYY-MM-DD format for input type="date".
 * @param {string | Date} dateInput - The date string or Date object.
 * @returns {string} The date in YYYY-MM-DD format, or an empty string if invalid.
 */
export const formatToYYYYMMDD = (dateInput) => {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      // If it's an invalid date, return as is if it already looks like YYYY-MM-DD
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
      return "";
    }
    return date.toISOString().split('T')[0]; // Returns only the date part (YYYY-MM-DD)
  } catch (e) {
    console.error("Error formatting date for input:", e);
    return "";
  }
};

export function parseYYYYMMDDToLocalDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date in local timezone at midnight (00:00:00)
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Adds a specified number of days to a YYYY-MM-DD date string.
 * Uses local calendar date to prevent UTC timezone shifts.
 * @param {string} dateString - "YYYY-MM-DD"
 * @param {number} [days=1]
 * @returns {string} "YYYY-MM-DD"
 */
export function addDaysToYYYYMMDD(dateString, days = 1) {
  if (!dateString) return "";
  const d = parseYYYYMMDDToLocalDate(dateString);
  if (!d) return "";
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}