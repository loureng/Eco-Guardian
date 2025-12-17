import { UserProfile, Plant, UserLocation, SunTolerance, DwellingType } from "../types";

const isString = (val: unknown): val is string => typeof val === "string";
const isNumber = (val: unknown): val is number => typeof val === "number" && !isNaN(val);
const isBoolean = (val: unknown): val is boolean => typeof val === "boolean";
const isArray = (val: unknown): val is unknown[] => Array.isArray(val);
const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === "object" && val !== null && !Array.isArray(val);

const validateUserLocation = (data: unknown): data is UserLocation => {
  if (!isObject(data)) return false;
  return (
    isNumber(data.latitude) &&
    isNumber(data.longitude) &&
    isString(data.city)
  );
};

const validateSunTolerance = (data: unknown): data is SunTolerance => {
  return isString(data) && Object.values(SunTolerance).includes(data as SunTolerance);
};

const validateDwellingType = (data: unknown): data is DwellingType => {
  return isString(data) && ["Casa", "Apartamento"].includes(data);
};

const validatePlant = (data: unknown): data is Plant => {
  if (!isObject(data)) return false;

  // Required fields
  if (!isString(data.id)) return false;
  if (!isString(data.scientificName)) return false;
  if (!isString(data.commonName)) return false;
  if (!isNumber(data.wateringFrequencyDays)) return false;
  if (!validateSunTolerance(data.sunTolerance)) return false;
  if (!isNumber(data.minTemp)) return false;
  if (!isNumber(data.maxTemp)) return false;

  // Optional fields types check
  if (data.category !== undefined && !isString(data.category)) return false;
  if (data.description !== undefined && !isString(data.description)) return false;
  if (data.origin !== undefined && !isString(data.origin)) return false;
  if (data.careTips !== undefined) {
      if (!isArray(data.careTips) || !data.careTips.every(isString)) return false;
  }

  if (data.fertilizer !== undefined && !isString(data.fertilizer)) return false;
  if (data.soil !== undefined && !isString(data.soil)) return false;
  if (data.environmentTips !== undefined && !isString(data.environmentTips)) return false;

  if (data.lastWatered !== undefined && !isNumber(data.lastWatered)) return false;

  if (data.wateringHistory !== undefined) {
      if (!isArray(data.wateringHistory) || !data.wateringHistory.every(isNumber)) return false;
  }

  if (data.imageUrl !== undefined && !isString(data.imageUrl)) return false;

  return true;
};

export const validateUserProfile = (data: unknown): data is UserProfile => {
  if (!isObject(data)) return false;

  if (!isString(data.id)) return false;
  if (!isString(data.name)) return false;

  if (data.dwellingType !== undefined && !validateDwellingType(data.dwellingType)) return false;

  if (data.location !== null) {
      if (!validateUserLocation(data.location)) return false;
  }

  if (!isArray(data.plants)) return false;
  if (!data.plants.every(validatePlant)) return false;

  if (!isArray(data.unlockedAchievements)) return false;
  if (!data.unlockedAchievements.every(isString)) return false;

  return true;
};
