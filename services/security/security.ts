
import { UserProfile, Plant, UserLocation } from "../../types";

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

  // 2. Remove dangerous HTML tags while preserving safe content.
  // React handles escaping for display, so we just want to remove script injection vectors.
  // This is a basic filter; for production, use a library like DOMPurify.
  clean = clean.replace(/<(\/?)(script|iframe|object|embed|applet|form|input|button)([^>]*?)>/ig, '');

  // Also handle javascript: pseudo-protocol in attributes if any remained (unlikely with just tag stripping, but safe)
  clean = clean.replace(/javascript:/gi, '');

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

  // Allow relative paths (starting with / or alphanumeric chars for subfolders)
  if (url.startsWith('/') || /^[a-zA-Z0-9_\-\.]/.test(url)) {
      // Check for dangerous protocol patterns even in relative-looking paths
      if (/^\s*(javascript|vbscript|data):/i.test(url)) {
          // Exception: data:image is allowed
          if (!/^\s*data:image\//i.test(url)) return false;
      }
      return true;
  }

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

/**
 * Reconstructs a Plant object strictly to avoid pollution.
 */
const sanitizePlant = (plant: any): Plant | null => {
  if (!plant || typeof plant !== 'object') return null;
  if (typeof plant.id !== 'string' || typeof plant.commonName !== 'string') return null;

  // Allow only whitelisted fields
  return {
    id: sanitizeInput(plant.id),
    scientificName: sanitizeInput(plant.scientificName || ''),
    commonName: sanitizeInput(plant.commonName),
    category: sanitizeInput(plant.category || ''),
    description: sanitizeInput(plant.description || ''),
    origin: sanitizeInput(plant.origin || ''),
    careTips: Array.isArray(plant.careTips) ? plant.careTips.map((t: any) => sanitizeInput(String(t))) : [],

    fertilizer: sanitizeInput(plant.fertilizer || ''),
    soil: sanitizeInput(plant.soil || ''),
    environmentTips: sanitizeInput(plant.environmentTips || ''),

    wateringFrequencyDays: typeof plant.wateringFrequencyDays === 'number' ? plant.wateringFrequencyDays : 7,
    sunTolerance: typeof plant.sunTolerance === 'string' ? plant.sunTolerance : "Meia-sombra", // Safe default
    minTemp: typeof plant.minTemp === 'number' ? plant.minTemp : 10,
    maxTemp: typeof plant.maxTemp === 'number' ? plant.maxTemp : 35,
    lastWatered: typeof plant.lastWatered === 'number' ? plant.lastWatered : undefined,
    wateringHistory: Array.isArray(plant.wateringHistory) ? plant.wateringHistory.filter((n: any) => typeof n === 'number') : [],
    imageUrl: (plant.imageUrl && isSafeSrc(plant.imageUrl)) ? plant.imageUrl : undefined
  } as Plant; // Casting as Plant because TS might complain about enum but we validated safely
};

/**
 * Validates the UserProfile structure to ensure data integrity and security when loading from storage.
 * Prevents loading corrupted or malicious state objects.
 */
export const validateUserProfile = (data: any): UserProfile | null => {
  if (!data || typeof data !== 'object') return null;

  // Check required fields types
  if (typeof data.id !== 'string' || typeof data.name !== 'string') {
    return null;
  }

  // Deeply sanitize plants
  const safePlants: Plant[] = [];
  if (Array.isArray(data.plants)) {
    data.plants.forEach((p: any) => {
      const clean = sanitizePlant(p);
      if (clean) safePlants.push(clean);
    });
  }

  // Sanitize achievements
  const safeAchievements = Array.isArray(data.unlockedAchievements)
    ? data.unlockedAchievements.filter((a: any) => typeof a === 'string').map((a: any) => sanitizeInput(a))
    : [];

  // Sanitize Location
  let safeLocation: UserLocation | null = null;
  if (data.location && typeof data.location === 'object') {
     if (typeof data.location.latitude === 'number' && typeof data.location.longitude === 'number' && typeof data.location.city === 'string') {
       safeLocation = {
         latitude: data.location.latitude,
         longitude: data.location.longitude,
         city: sanitizeInput(data.location.city)
       };
     }
  }

  // Construct a clean object to discard any injected extra properties
  const profile: UserProfile = {
    id: sanitizeInput(data.id),
    name: sanitizeInput(data.name),
    dwellingType: (data.dwellingType === 'Casa' || data.dwellingType === 'Apartamento') ? data.dwellingType : undefined,
    location: safeLocation,
    plants: safePlants,
    unlockedAchievements: safeAchievements
  };

  return profile;
};
