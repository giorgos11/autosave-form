import type { ChangeEvent } from "react";
import type { Skill } from "../SkillsList/SkillsList.constants";

export type SortableSkillItemProps = {
  skill: Skill;
  index: number;
  total: number;
  onNameChange: (event: ChangeEvent<HTMLInputElement>, id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (id: string) => void;
};
