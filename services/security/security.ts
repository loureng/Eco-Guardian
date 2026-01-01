
/**
 * Sentinel Security Service
 * Centralized input validation and sanitization.
 */

/**
 * Sanitizes user input to prevent XSS and other injection attacks.
 * Strips HTML tags and limits length.
 */
export const sanitizeInput = (input: string, maxLength: number = 500): string => {
  if (typeof input !== 'string') return '';

  // 1. Trim whitespace
  let clean = input.trim();

  // 2. Remove potentially dangerous HTML tags (basic strip)
  // This is a naive implementation; for robust XSS, use DOMPurify in production.
  // However, since we use React which auto-escapes, this is primarily to prevent
  // storage of garbage or malicious payloads that might be used elsewhere.
  clean = clean.replace(/<[^>]*>?/gm, '');

  // 3. Limit length to prevent DoS
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  return clean;
};

/**
 * Validates if a URL is safe (http/https/data) and not a script execution vector.
 */
export const isSafeUrl = (url: string): boolean => {
  if (!url) return false;

  // Allow relative paths
  if (url.startsWith('/')) return true;

  // Allow http, https, and data (images)
  // Reject javascript: vbscript: etc
  const protocolPattern = /^(https?|data):/i;

  // Check for javascript: explicitly
  if (url.toLowerCase().trim().startsWith('javascript:')) return false;
  if (url.toLowerCase().trim().startsWith('vbscript:')) return false;

  return protocolPattern.test(url);
};

/**
 * Validates image sources specifically
 */
export const isSafeSrc = (src: string): boolean => {
    return isSafeUrl(src);
}
