
/**
 * Security utility functions for EcoGuardian.
 * Centralizes security logic to ensure consistency and testability.
 */

/**
 * Validates if a URL is safe to use (http/https only).
 * Prevents XSS via javascript: URIs.
 *
 * @param url The URL to validate
 * @returns true if the URL is safe, false otherwise
 */
export const isSafeUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitizes user input for display to prevent XSS.
 * Note: React handles most of this automatically, but this is useful for
 * raw HTML manipulation or other contexts.
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
