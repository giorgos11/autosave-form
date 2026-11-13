import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChangeEvent } from "react";
import { SKILL_NAME_MAX } from "@/features/user-profile/domain/constants/validation";
import type { Skill } from "@/features/user-profile/domain/entities/skill";
import styles from "./SortableSkillItem.module.css";

type SortableSkillItemProps = {
  skill: Skill;
  index: number;
  total: number;
  onNameChange: (event: ChangeEvent<HTMLInputElement>, id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (id: string) => void;
};

export const SortableSkillItem = ({
  skill,
  index,
  total,
  onNameChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SortableSkillItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${isDragging ? styles.itemDragging : ""}`}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={`Drag skill ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <input
        type="text"
        value={skill.name}
        maxLength={SKILL_NAME_MAX}
        placeholder="Skill name"
        aria-label={`Skill ${index + 1}`}
        onChange={(event) => onNameChange(event, skill.id)}
      />
      <div className={styles.actions}>
        <button
          type="button"
          aria-label={`Move skill ${index + 1} up`}
          disabled={index === 0}
          onClick={() => onMoveUp(index)}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label={`Move skill ${index + 1} down`}
          disabled={index === total - 1}
          onClick={() => onMoveDown(index)}
        >
          ↓
        </button>
        <button
          type="button"
          aria-label={`Remove skill ${index + 1}`}
          onClick={() => onRemove(skill.id)}
        >
          Remove
        </button>
      </div>
    </li>
  );
};
