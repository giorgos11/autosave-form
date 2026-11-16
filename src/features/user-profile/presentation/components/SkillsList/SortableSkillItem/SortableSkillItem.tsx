import { SKILL_NAME_MAX } from "@/features/user-profile/domain/constants/validation";
import type { Skill } from "@/features/user-profile/domain/entities/skill";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, type KeyboardEvent } from "react";
import styles from "./SortableSkillItem.module.css";

type SortableSkillItemProps = {
  skill: Skill;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  shouldFocus?: boolean;
  onNameChange: (name: string) => void;
  onInsertAfter: () => void;
  onFocused?: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export const SortableSkillItem = ({
  skill,
  position,
  isFirst,
  isLast,
  shouldFocus = false,
  onNameChange,
  onInsertAfter,
  onFocused,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SortableSkillItemProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

  useEffect(() => {
    if (!shouldFocus) return;
    inputRef.current?.focus();
    onFocused?.();
  }, [shouldFocus]); // eslint-disable-line react-hooks/exhaustive-deps -- focus once when requested

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const liClassName = [styles.item, isDragging && styles.itemDragging]
    .filter(Boolean)
    .join(" ");

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onInsertAfter();
      return;
    }

    if (event.key === "ArrowUp" && !isFirst) {
      event.preventDefault();
      onMoveUp();
      queueMicrotask(() => inputRef.current?.focus());
      return;
    }

    if (event.key === "ArrowDown" && !isLast) {
      event.preventDefault();
      onMoveDown();
      queueMicrotask(() => inputRef.current?.focus());
    }
  };

  return (
    <li ref={setNodeRef} style={style} className={liClassName}>
      <button
        ref={setActivatorNodeRef}
        type="button"
        className={styles.dragHandle}
        aria-label={`Drag skill ${position}`}
        {...attributes}
        {...listeners}
      >
        <span aria-hidden="true">⋮⋮</span>
      </button>
      <input
        ref={inputRef}
        type="text"
        className={styles.nameInput}
        value={skill.name}
        maxLength={SKILL_NAME_MAX}
        placeholder="Skill name"
        aria-label={`Skill ${position}`}
        onChange={(event) => onNameChange(event.target.value)}
        onKeyDown={handleKeyDown}
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
          <span className={styles.removeLabel}>Remove</span>
          <span className={styles.removeIcon} aria-hidden="true">
            ×
          </span>
        </button>
      </div>
    </li>
  );
};
