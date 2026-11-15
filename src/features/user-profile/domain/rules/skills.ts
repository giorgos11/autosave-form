import type { Skill } from "../entities/skill";

export type CreateSkillParams = {
  name?: string;
};

export const createSkill = ({ name = "" }: CreateSkillParams = {}): Skill => ({
  id: crypto.randomUUID(),
  name,
});

export type MoveSkillParams = {
  skills: readonly Skill[];
  fromIndex: number;
  toIndex: number;
};

export const moveSkill = ({
  skills,
  fromIndex,
  toIndex,
}: MoveSkillParams): readonly Skill[] => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= skills.length ||
    toIndex >= skills.length ||
    fromIndex === toIndex
  ) {
    return skills;
  }

  const next = [...skills];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
};

export type RemoveSkillParams = {
  skills: readonly Skill[];
  id: string;
};

export const removeSkill = ({
  skills,
  id,
}: RemoveSkillParams): readonly Skill[] => {
  return skills.filter((skill) => skill.id !== id);
};

export type UpdateSkillNameParams = {
  skills: readonly Skill[];
  id: string;
  name: string;
};

export const updateSkillName = ({
  skills,
  id,
  name,
}: UpdateSkillNameParams): readonly Skill[] => {
  return skills.map((skill) => (skill.id === id ? { ...skill, name } : skill));
};

export type InsertSkillAfterParams = {
  skills: readonly Skill[];
  afterId: string;
  skill?: Skill;
};

export const insertSkillAfter = ({
  skills,
  afterId,
  skill = createSkill(),
}: InsertSkillAfterParams): { skills: readonly Skill[]; inserted: Skill } => {
  const index = skills.findIndex((item) => item.id === afterId);
  if (index === -1) {
    return { skills: [...skills, skill], inserted: skill };
  }

  const next = [...skills];
  next.splice(index + 1, 0, skill);
  return { skills: next, inserted: skill };
};
