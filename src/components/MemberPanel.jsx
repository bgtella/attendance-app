import { useMemo } from 'react';
import CoupleCard from './CoupleCard';
import MemberCard from './MemberCard';
import { useGroupedRoster } from '../hooks/useGroupedRoster';

export default function MemberPanel({ members, activeCluster, activeHousehold, attendance, onToggle }) {
  const groupedRoster = useGroupedRoster(members, activeCluster, activeHousehold);

  const currentHouseholdTotal = useMemo(() => {
    return members.filter(
      (m) =>
        m.household.toUpperCase() === activeHousehold.toUpperCase() &&
        m.cluster.toUpperCase() === activeCluster.toUpperCase() &&
        !m.name.includes('(+)')
    ).length;
  }, [members, activeCluster, activeHousehold]);

  const currentHouseholdPresent = useMemo(() => {
    return members.filter(
      (m) =>
        m.household.toUpperCase() === activeHousehold.toUpperCase() &&
        m.cluster.toUpperCase() === activeCluster.toUpperCase() &&
        attendance[m.id] &&
        !m.name.includes('(+)')
    ).length;
  }, [members, attendance, activeCluster, activeHousehold]);

  return (
    <div className="w-full md:w-2/3">
      {/* Panel Header */}
      <div className="mb-6 pb-2 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {activeHousehold || 'Select a Household'}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Active Members: {currentHouseholdTotal} &bull; Present: {currentHouseholdPresent}
          </p>
        </div>
        <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          {activeCluster} Cluster
        </span>
      </div>

      {/* Member List */}
      <div className="space-y-4">
        {!activeHousehold ? (
          <p className="text-slate-400 italic py-8 text-center bg-slate-50 rounded-2xl border border-dashed">
            Select a household unit on the left to display names.
          </p>
        ) : groupedRoster.length === 0 ? (
          <p className="text-slate-400 italic py-8 text-center bg-slate-50 rounded-2xl border border-dashed">
            No members or guests in this household. Click &ldquo;Register Guest&rdquo; to add.
          </p>
        ) : (
          groupedRoster.map((group) =>
            group.type === 'COUPLE' ? (
              <CoupleCard
                key={group.key}
                group={group}
                attendance={attendance}
                onToggle={onToggle}
              />
            ) : (
              <MemberCard
                key={group.key}
                person={group.person}
                isPresent={!!attendance[group.person.id]}
                onToggle={onToggle}
              />
            )
          )
        )}
      </div>
    </div>
  );
}
