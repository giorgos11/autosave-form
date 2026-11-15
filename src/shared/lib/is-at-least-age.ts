const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export type IsAtLeastAgeParams = {
  dateOfBirth: string;
  age: number;
  now?: Date;
};

export const isAtLeastAge = ({
  dateOfBirth,
  age,
  now = new Date(),
}: IsAtLeastAgeParams): boolean => {
  const match = ISO_DATE_PATTERN.exec(dateOfBirth);
  if (!match) return false;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  const birthDate = new Date(year, monthIndex, day);
  const isRealDate =
    birthDate.getFullYear() === year &&
    birthDate.getMonth() === monthIndex &&
    birthDate.getDate() === day;
  if (!isRealDate) return false;

  const hadBirthdayThisYear =
    now.getMonth() > monthIndex ||
    (now.getMonth() === monthIndex && now.getDate() >= day);
  const years = now.getFullYear() - year - (hadBirthdayThisYear ? 0 : 1);

  return years >= age;
};
