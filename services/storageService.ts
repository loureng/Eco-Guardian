import { UserProfile } from "../types";
import { isSafeJSON } from "./security/security";

const KEY = "ECO_GUARDIAN_USER";

export const saveUser = (user: UserProfile) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user", e);
  }
};

export const loadUser = (): UserProfile | null => {
  const data = localStorage.getItem(KEY);
  // Security: Use safe JSON parsing to prevent crashes from corrupted local storage
  return isSafeJSON<UserProfile>(data);
};