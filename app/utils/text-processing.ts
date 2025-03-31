/**
 * Cleans and truncates text for API usage, specifically for TTS.
 *
 * - Removes control characters.
 * - Replaces line/paragraph separators with spaces.
 * - Keeps only letters, numbers, punctuation, and spaces (Unicode-aware).
 * - Normalizes whitespace.
 * - Truncates to a specified maximum length.
 *
 * @param text The input text string.
 * @param maxLength The maximum allowed length before truncation (defaults to 1000).
 * @returns The cleaned and potentially truncated text string.
 */
export function cleanAndTruncateText(text: string, maxLength: number = 1000): string {
  if (!text) {
    return ""; // Return empty string if input is null, undefined, or empty
  }

  // Aggressive text cleaning for TTS quality
  let cleanedText = text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
    .replace(/[\u2028\u2029]/g, " ")          // Replace line/paragraph separators with spaces
    // Keep only letters, numbers, basic spaces, and safe punctuation .,!?;:'"()-
    .replace(/[^\p{L}\p{N}\s.,!?;:'"()\\\-\]]/gu, "") // Escaped ] and -
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Normalize repeated punctuation - Assign the result of the chain back to cleanedText
  cleanedText = cleanedText
    .replace(/(!)\1+/g, '$1') // Replace !!+ with !
    .replace(/(\?)\1+/g, '$1') // Replace ??+ with ?
    .replace(/(\.)\1+/g, '$1') // Replace ..+ with .
    .replace(/(,)\1+/g, '$1') // Replace ,,+ with ,
    .replace(/(;)\1+/g, '$1') // Replace ;;+ with ;
    .replace(/(:)\1+/g, '$1') // Replace ::+ with :
    .replace(/(')\1+/g, '$1') // Replace ''+ with '
    .replace(/(")\1+/g, '$1') // Replace ""+ with "
    .replace(/(-)\1+/g, '$1'); // Replace --+ with -

  // Re-normalize whitespace again after punctuation changes and trim
  cleanedText = cleanedText.replace(/\s+/g, " ").trim();

  // Truncate at the last word boundary before maxLength, if possible
  let truncatedText = cleanedText;
  if (cleanedText.length > maxLength) {
    const sub = cleanedText.substring(0, maxLength);
    const lastSpaceIndex = sub.lastIndexOf(' ');
    // Truncate at the last space if found and it's not the very beginning
    if (lastSpaceIndex > 0) {
      truncatedText = sub.substring(0, lastSpaceIndex);
    } else {
      // No space found, or space is at index 0; truncate hard at maxLength
      truncatedText = sub;
    }
  }

  // Final trim in case truncation left trailing space
  return truncatedText.trim();
}