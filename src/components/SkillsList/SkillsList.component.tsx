import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSkillItem } from "../SortableSkillItem/SortableSkillItem.component";
import type { SkillsListProps } from "./SkillsList.constants";
import styles from "./SkillsList.module.css";

export const SkillsList = ({
  skills,
  onAddSkill,
  onRemoveSkill,
  onMoveSkillUp,
  onMoveSkillDown,
  onDragEnd,
  onSkillNameChange,
}: SkillsListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <section className={styles.skills}>
      <header className={styles.header}>
        <h2>Skills</h2>
        <p>Add skills and set their order.</p>
      </header>

      {skills.length === 0 ? (
        <p className={styles.empty}>No skills yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
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
                  index={index}
                  total={skills.length}
                  onNameChange={onSkillNameChange}
                  onMoveUp={onMoveSkillUp}
                  onMoveDown={onMoveSkillDown}
                  onRemove={onRemoveSkill}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <button type="button" className={styles.addButton} onClick={onAddSkill}>
        Add skill
      </button>
    </section>
  );
};
