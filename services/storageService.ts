import { UserProfile } from "../types";

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
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load user", e);
    return null;
  }
};