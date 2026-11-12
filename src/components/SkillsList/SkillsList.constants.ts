import type { DragEndEvent } from "@dnd-kit/core";
import type { ChangeEvent } from "react";

export type Skill = {
  id: string;
  name: string;
};

export const SKILL_NAME_MAX = 50;

export type SkillsListProps = {
  skills: Skill[];
  onAddSkill: () => void;
  onRemoveSkill: (id: string) => void;
  onMoveSkillUp: (index: number) => void;
  onMoveSkillDown: (index: number) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onSkillNameChange: (event: ChangeEvent<HTMLInputElement>, id: string) => void;
};
