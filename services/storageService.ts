import { UserProfile } from "../types";
import { validateUserProfile } from "./security/security";

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
    return validateUserProfile(parsed);
  } catch (e) {
    console.error("Failed to load user", e);
    return null;
  }
};
