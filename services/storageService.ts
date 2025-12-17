import { UserProfile } from "../types";
import { validateUserProfile } from "./validationService";

const KEY = "ECO_GUARDIAN_USER";

export const saveUser = (user: UserProfile) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user", e);
  }
};

export const loadUser = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);

    if (validateUserProfile(parsed)) {
      return parsed;
    } else {
      console.error("User profile in storage is invalid or corrupted.");
      // In a real app, we might try to migrate or partial recovery,
      // but for security/integrity, we reject invalid data.
      return null;
    }
  } catch (e) {
    console.error("Failed to load user", e);
    return null;
  }
};
