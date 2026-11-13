import type { Skill } from "@/features/user-profile/domain/entities/skill";
import type { Announcements, UniqueIdentifier } from "@dnd-kit/core";

export const createSkillsAnnouncements = (
  skills: readonly Skill[],
): Announcements => {
  const total = skills.length;

  const positionOf = (id: UniqueIdentifier) =>
    skills.findIndex((skill) => skill.id === id) + 1;

  const labelOf = (id: UniqueIdentifier) => {
    const position = positionOf(id);
    const name = skills[position - 1]?.name.trim();
    return name ? `Skill "${name}"` : `Skill ${position}`;
  };

  return {
    onDragStart: ({ active }) =>
      `Picked up ${labelOf(active.id)}. It is in position ${positionOf(active.id)} of ${total}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${labelOf(active.id)} was moved into position ${positionOf(over.id)} of ${total}.`
        : `${labelOf(active.id)} is no longer over the list.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `${labelOf(active.id)} was dropped at position ${positionOf(over.id)} of ${total}.`
        : `${labelOf(active.id)} was dropped.`,
    onDragCancel: ({ active }) =>
      `Reordering cancelled. ${labelOf(active.id)} returned to position ${positionOf(active.id)} of ${total}.`,
  };
};
