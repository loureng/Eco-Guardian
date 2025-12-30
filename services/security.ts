/**
 * Security utility functions for EcoGuardian.
 * Centralizes security logic to ensure consistency and testability.
 */

/**
 * Validates if a URL is safe to use for links (http/https only).
 * Prevents XSS via javascript: URIs.
 *
 * @param url The URL to validate
 * @returns true if the URL is safe, false otherwise
 */
export const isSafeUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    // Handle relative URLs
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
       return true; // Relative URLs are generally safe from XSS unless they lead to open redirect endpoints, but protocol-wise they are safe.
    }
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Validates if a URL is safe to use for image sources (http/https/data only).
 * Allows data URIs for user-uploaded images but prevents javascript: URIs.
 *
 * @param url The URL to validate
 * @returns true if the URL is safe for img src
 */
export const isSafeSrc = (url: string): boolean => {
  if (!url) return false;
  try {
     // Handle relative URLs
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
       return true;
    }
    const parsed = new URL(url);
    return ['http:', 'https:', 'data:'].includes(parsed.protocol);
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
