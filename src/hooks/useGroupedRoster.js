// ============================================================
// useGroupedRoster.js
// Groups members of a household into couples and singles.
// Uses the `lastName` field directly for couple pairing.
// ============================================================

import { useMemo } from 'react';

export const useGroupedRoster = (members, activeCluster, activeHousehold) => {
  return useMemo(() => {
    if (!activeHousehold) return [];

    const householdMembers = members.filter(
      (m) =>
        m.household.toUpperCase() === activeHousehold.toUpperCase() &&
        m.cluster.toUpperCase() === activeCluster.toUpperCase()
    );

    const groups = {};

    householdMembers.forEach((member) => {
      // Use lastName field if available; fall back to splitting the name string
      const familyName = member.lastName
        ? member.lastName.replace('(+)', '').trim()
        : member.name.trim().split(' ').pop().replace('(+)', '').trim();

      if (!groups[familyName]) groups[familyName] = [];
      groups[familyName].push(member);
    });

    const couplesList = [];
    const singlesList = [];

    Object.keys(groups).forEach((fam) => {
      const list = groups[fam];
      if (list.length === 2) {
        couplesList.push({ key: fam, type: 'COUPLE', p1: list[0], p2: list[1] });
      } else {
        list.forEach((item) =>
          singlesList.push({ key: item.id, type: 'SINGLE', person: item })
        );
      }
    });

    return [...couplesList, ...singlesList];
  }, [members, activeCluster, activeHousehold]);
};
