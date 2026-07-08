// Single member attendance card
export default function MemberCard({ person, isPresent, onToggle }) {
  const isDeceased =
    (person.firstName || '').includes('(+)') ||
    (person.lastName  || '').includes('(+)') ||
    (person.name      || '').includes('(+)');

  return (
    <div
      onClick={() => onToggle(person.id, isDeceased)}
      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
        isDeceased
          ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
          : isPresent
          ? 'bg-green-50 border-green-200 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="pr-2">
        <p className={`font-semibold text-base md:text-lg tracking-wide ${
          isDeceased
            ? 'text-slate-400 italic line-through'
            : isPresent
            ? 'text-green-800 font-bold'
            : 'text-slate-700'
        }`}>
          {person.name}
        </p>
        {person.type === 'Guest' && (
          <span className="inline-block mt-1 bg-purple-100 text-purple-700 text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase">
            Guest
          </span>
        )}
        {isDeceased && <span className="text-[10px] font-bold text-slate-400 block mt-1">RIP</span>}
      </div>
      <div className="shrink-0">
        {isDeceased ? (
          <span className="text-slate-300 font-bold text-2xl mr-1">†</span>
        ) : isPresent ? (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 bg-white"></div>
        )}
      </div>
    </div>
  );
}
