import type { Skill } from "@/features/user-profile/domain/entities/skill";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import styles from "./SkillsList.module.css";
import { createSkillsAnnouncements } from "./skills-announcements";
import { SortableSkillItem } from "./SortableSkillItem/SortableSkillItem";
import { useSkillsEditor, type UpdateSkills } from "./use-skills-editor";

type SkillsListProps = {
  skills: readonly Skill[];
  onSkillsChange: UpdateSkills;
};

export const SkillsList = ({ skills, onSkillsChange }: SkillsListProps) => {
  const { add, insertAfter, remove, rename, moveUp, moveDown, reorder } =
    useSkillsEditor({
      updateSkills: onSkillsChange,
    });
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  const focusNewSkill = (id: string) => {
    setPendingFocusId(id);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    reorder({ activeId: String(active.id), overId: String(over.id) });
  };

  return (
    <section className={styles.skills} aria-labelledby="skills-heading">
      <header className={styles.header}>
        <h2 id="skills-heading">Skills</h2>
        <p>Add skills and set their order.</p>
      </header>

      {skills.length === 0 ? (
        <p className={styles.empty}>No skills yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{ announcements: createSkillsAnnouncements(skills) }}
        >
          <SortableContext
            items={skills.map((skill) => skill.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className={styles.list}>
              {skills.map((skill, index) => (
                <SortableSkillItem
                  key={skill.id}
                  skill={skill}
                  position={index + 1}
                  isFirst={index === 0}
                  isLast={index === skills.length - 1}
                  shouldFocus={skill.id === pendingFocusId}
                  onNameChange={(name) => rename(skill.id, name)}
                  onInsertAfter={() => focusNewSkill(insertAfter(skill.id))}
                  onFocused={() => setPendingFocusId(null)}
                  onMoveUp={() => moveUp(index)}
                  onMoveDown={() => moveDown(index)}
                  onRemove={() => remove(skill.id)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <button
        type="button"
        className={styles.addButton}
        onClick={() => focusNewSkill(add())}
      >
        Add skill
      </button>
    </section>
  );
};
