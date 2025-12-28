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
 * Sanitizes user input by stripping HTML tags to prevent XSS.
 * This is useful for cleaning up plain text inputs like plant names or categories
 * where no HTML markup is expected or allowed.
 *
 * Example: "<b>Rose</b>" -> "Rose"
 * Example: "<script>alert(1)</script>" -> "alert(1)" (content remains, tag removed)
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  // Strip all HTML tags
  return input.replace(/<\/?[^>]+(>|$)/g, "").trim();
};
