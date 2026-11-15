import type { Skill } from "@/features/user-profile/domain/entities/skill";
import {
  createSkill,
  insertSkillAfter,
  moveSkill,
  removeSkill,
  updateSkillName,
} from "@/features/user-profile/domain/rules/skills";

export type UpdateSkills = (
  getNextSkills: (skills: readonly Skill[]) => readonly Skill[],
) => void;

export type UseSkillsEditorParams = {
  updateSkills: UpdateSkills;
};

export const useSkillsEditor = ({ updateSkills }: UseSkillsEditorParams) => {
  const add = (): string => {
    const skill = createSkill();
    updateSkills((skills) => [...skills, skill]);
    return skill.id;
  };

  const insertAfter = (afterId: string): string => {
    const skill = createSkill();
    updateSkills((skills) => insertSkillAfter({ skills, afterId, skill }).skills);
    return skill.id;
  };

  const remove = (id: string) => {
    updateSkills((skills) => removeSkill({ skills, id }));
  };

  const rename = (id: string, name: string) => {
    updateSkills((skills) => updateSkillName({ skills, id, name }));
  };

  const moveUp = (index: number) => {
    updateSkills((skills) =>
      moveSkill({ skills, fromIndex: index, toIndex: index - 1 }),
    );
  };

  const moveDown = (index: number) => {
    updateSkills((skills) =>
      moveSkill({ skills, fromIndex: index, toIndex: index + 1 }),
    );
  };

  const reorder = ({
    activeId,
    overId,
  }: {
    activeId: string;
    overId: string;
  }) => {
    updateSkills((skills) => {
      const fromIndex = skills.findIndex((skill) => skill.id === activeId);
      const toIndex = skills.findIndex((skill) => skill.id === overId);
      return moveSkill({ skills, fromIndex, toIndex });
    });
  };

  return { add, insertAfter, remove, rename, moveUp, moveDown, reorder };
};
