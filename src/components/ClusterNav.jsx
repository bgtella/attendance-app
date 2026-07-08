export default function ClusterNav({ clusters, activeCluster, onSelect }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
        1. Select Cluster
      </label>
      <div className="grid grid-cols-2 gap-2">
        {clusters.map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold text-center tracking-wide transition-all border ${
              activeCluster === c
                ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
