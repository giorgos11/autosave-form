import type { UserProfile } from "../entities/user-profile";

export const INITIAL_USER_PROFILE: UserProfile = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  bio: "",
  dateOfBirth: "",
  newsletter: false,
  skills: [],
};
