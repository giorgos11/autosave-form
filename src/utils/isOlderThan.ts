export interface IsOlderThanParams {
  dateOfBirth: string;
  age: number;
}

export const isOlderThan = ({ dateOfBirth, age }: IsOlderThanParams): boolean => {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return false;

  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    years -= 1;
  }
  return years >= age;
};
