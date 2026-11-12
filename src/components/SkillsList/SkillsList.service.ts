import type { Skill } from "./SkillsList.constants";

export interface CreateSkillParams {
  name?: string;
}

export const createSkill = ({ name = "" }: CreateSkillParams = {}): Skill => ({
  id: crypto.randomUUID(),
  name,
});

export interface MoveSkillParams {
  skills: Skill[];
  fromIndex: number;
  toIndex: number;
}

export const moveSkill = ({
  skills,
  fromIndex,
  toIndex,
}: MoveSkillParams): Skill[] => {
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

export interface RemoveSkillParams {
  skills: Skill[];
  id: string;
}

export const removeSkill = ({ skills, id }: RemoveSkillParams): Skill[] => {
  return skills.filter((skill) => skill.id !== id);
};

export interface UpdateSkillNameParams {
  skills: Skill[];
  id: string;
  name: string;
}

export const updateSkillName = ({
  skills,
  id,
  name,
}: UpdateSkillNameParams): Skill[] => {
  return skills.map((skill) => (skill.id === id ? { ...skill, name } : skill));
};
