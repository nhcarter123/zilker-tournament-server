import { chunk } from 'lodash';

export const batchGroups = (groups: string[][], maxPunchDown: number) =>
  groups.flatMap(group => chunk(group, maxPunchDown));

export const swissSplit = (group: string[]) => {
  const halfLength = Math.ceil(group.length / 2);
  const topPlayers = group.splice(0, halfLength);

  return [topPlayers, group];
};

export const fillGaps = (parallelGroups: string[][][]) => {
  const filledGroups = [];

  for (let i = 0; i < parallelGroups.length; i++) {
    const groupA = parallelGroups[i][0] || [];
    const groupB = parallelGroups[i][1] || [];

    if (i < parallelGroups.length - 1) {
      while (groupA.length !== groupB.length) {
        while (groupB.length < groupA.length) {
          const nextGroupA = parallelGroups[i + 1][0] || [];

          groupB.push(nextGroupA.shift() || '');
        }

        while (groupA.length < groupB.length) {
          groupA.push(groupB.shift() || '');
        }
      }
    }

    filledGroups.push([groupA, groupB]);
  }

  return filledGroups;
};
