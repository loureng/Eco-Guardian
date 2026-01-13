export const isSafeUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const protocol = new URL(url).protocol;
    return ['http:', 'https:'].includes(protocol);
  } catch {
    return false;
  }
};

export const sanitizeForPrompt = (input: string): string => {
  // Removes control characters and limits length to prevent DoS/Injection abuse
  if (!input) return "";
  return input.replace(/[\x00-\x1F\x7F]/g, "").slice(0, 100);
};
