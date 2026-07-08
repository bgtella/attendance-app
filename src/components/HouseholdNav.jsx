export default function HouseholdNav({ households, activeHousehold, activeCluster, members, attendance, onSelect }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
        2. Select Household
      </label>
      <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
        {households.map((household) => {
          const countPresent = members
            .filter(
              (m) =>
                m.household.toUpperCase() === household.toUpperCase() &&
                m.cluster.toUpperCase() === activeCluster.toUpperCase() &&
                !m.name.includes('(+)')
            )
            .filter((m) => attendance[m.id]).length;

          return (
            <button
              key={household}
              onClick={() => onSelect(household)}
              className={`text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center text-sm ${
                activeHousehold.toUpperCase() === household.toUpperCase()
                  ? 'bg-blue-50 border-blue-200 border text-blue-800 font-semibold shadow-xs'
                  : 'bg-white border-slate-100 border text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{household}</span>
              {countPresent > 0 && (
                <span className="bg-green-100 text-green-700 text-xs py-1 px-2.5 rounded-full font-bold shrink-0">
                  {countPresent}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
