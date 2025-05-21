import type { Group } from '@repo/backend/prisma/client';

export type GroupWithSubgroups = {
  readonly id: Group['id'];
  readonly name: Group['name'];
  readonly emoji: Group['emoji'];
  readonly parentGroupId: Group['parentGroupId'];
  readonly subgroups: GroupWithSubgroups[];
};

export const nestGroups = (
  groups: {
    readonly id: Group['id'];
    readonly name: Group['name'];
    readonly emoji: Group['emoji'];
    readonly parentGroupId: Group['parentGroupId'];
  }[]
): GroupWithSubgroups[] => {
  const groupsMap = new Map<string, GroupWithSubgroups>();
  const topLevelGroups: GroupWithSubgroups[] = [];

  // Initialize each group with an empty subgroups array
  for (const group of groups) {
    groupsMap.set(group.id, { ...group, subgroups: [] });
  }

  // Build the nested structure
  for (const group of groups) {
    const newGroup = groupsMap.get(group.id);

    if (!newGroup) {
      continue;
    }

    if (group.parentGroupId) {
      const parentGroup = groupsMap.get(group.parentGroupId);

      if (!parentGroup) {
        continue;
      }

      parentGroup.subgroups.push(newGroup);
    } else {
      topLevelGroups.push(newGroup);
    }
  }

  return topLevelGroups;
};
