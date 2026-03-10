import type { UserProfile } from "./authTypes";

const LS_PROFILE = "escolazoe.profile";

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(LS_PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function setProfile(profile: UserProfile) {
  localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
}

export function clearProfile() {
  localStorage.removeItem(LS_PROFILE);
}
