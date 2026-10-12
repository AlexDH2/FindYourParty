/**
 * Extracts YouTube Video ID and returns a clean embed URL.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 *
 * @param {string} url - YouTube URL
 * @returns {string|null} Embed URL or null if invalid
 */
export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()

  const regExp = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  const match = trimmed.match(regExp)

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`
  }

  return null
}
