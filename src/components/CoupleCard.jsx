// Couple side-by-side attendance card
function SpouseCell({ person, isPresent, onToggle }) {
  const isDeceased =
    (person.firstName || '').includes('(+)') ||
    (person.lastName  || '').includes('(+)') ||
    (person.name      || '').includes('(+)');
  return (
    <div
      onClick={() => onToggle(person.id, isDeceased)}
      className={`p-4 cursor-pointer transition-all flex items-center justify-between ${
        isDeceased
          ? 'bg-slate-50/50 cursor-not-allowed opacity-60'
          : isPresent
          ? 'bg-green-50/50 hover:bg-green-50'
          : 'hover:bg-slate-50/50'
      }`}
    >
      <div className="pr-2">
        <p className={`font-semibold text-sm md:text-base ${
          isDeceased
            ? 'text-slate-400 italic line-through'
            : isPresent
            ? 'text-green-800 font-bold'
            : 'text-slate-700'
        }`}>
          {person.name}
        </p>
        {isDeceased && <span className="text-[10px] font-bold text-slate-400 block mt-1">RIP</span>}
      </div>
      <div className="shrink-0">
        {isDeceased ? (
          <span className="text-slate-300 font-bold text-lg">†</span>
        ) : isPresent ? (
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white"></div>
        )}
      </div>
    </div>
  );
}

export default function CoupleCard({ group, attendance, onToggle }) {
  return (
    <div className="bg-white border border-slate-150 rounded-xl shadow-xs overflow-hidden">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500 tracking-wider">
          {group.key} Couple
        </span>
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
          Spouses
        </span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-100">
        <SpouseCell person={group.p1} isPresent={!!attendance[group.p1.id]} onToggle={onToggle} />
        <SpouseCell person={group.p2} isPresent={!!attendance[group.p2.id]} onToggle={onToggle} />
      </div>
    </div>
  );
}
