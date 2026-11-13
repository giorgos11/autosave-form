export type SkillDto = {
  id: string;
  name: string;
};

export type UserProfileDto = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
  dateOfBirth: string;
  newsletter: boolean;
  skills: SkillDto[];
};
