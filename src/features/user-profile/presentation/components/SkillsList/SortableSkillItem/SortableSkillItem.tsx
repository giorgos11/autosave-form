import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SKILL_NAME_MAX } from "@/features/user-profile/domain/constants/validation";
import type { Skill } from "@/features/user-profile/domain/entities/skill";
import styles from "./SortableSkillItem.module.css";

type SortableSkillItemProps = {
  skill: Skill;
  /** 1-based position in the list, used for accessible labels. */
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onNameChange: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export const SortableSkillItem = ({
  skill,
  position,
  isFirst,
  isLast,
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

  const className = [styles.item, isDragging && styles.itemDragging]
    .filter(Boolean)
    .join(" ");

  return (
    <li ref={setNodeRef} style={style} className={className}>
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={`Drag skill ${position}`}
        {...attributes}
        {...listeners}
      >
        <span aria-hidden="true">⋮⋮</span>
      </button>
      <input
        type="text"
        className={styles.nameInput}
        value={skill.name}
        maxLength={SKILL_NAME_MAX}
        placeholder="Skill name"
        aria-label={`Skill ${position}`}
        onChange={(event) => onNameChange(event.target.value)}
      />
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionButton}
          aria-label={`Move skill ${position} up`}
          disabled={isFirst}
          onClick={onMoveUp}
        >
          <span aria-hidden="true">↑</span>
        </button>
        <button
          type="button"
          className={styles.actionButton}
          aria-label={`Move skill ${position} down`}
          disabled={isLast}
          onClick={onMoveDown}
        >
          <span aria-hidden="true">↓</span>
        </button>
        <button
          type="button"
          className={styles.actionButton}
          aria-label={`Remove skill ${position}`}
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </li>
  );
};
