export default function GuestModal({ show, onClose, onSubmit, clusters, clusterHHMap, guestCluster, guestHousehold, guestFirstName, guestLastName, onFirstNameChange, onLastNameChange, onClusterChange, onHouseholdChange }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4 text-slate-800">Register Guest</h3>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">First Name</label>
              <input
                type="text"
                required
                value={guestFirstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. MARIA"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={guestLastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. SANTOS"
              />
            </div>

            {/* Cluster */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Assign to Cluster</label>
              <select
                value={guestCluster}
                onChange={(e) => onClusterChange(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-700"
              >
                {clusters.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Household */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Assign to Household</label>
              <select
                value={guestHousehold}
                onChange={(e) => onHouseholdChange(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-700"
              >
                {(clusterHHMap[guestCluster] || []).map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
