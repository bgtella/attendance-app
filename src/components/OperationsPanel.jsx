export default function OperationsPanel({
  onOpenGuestForm,
  onSyncToSheets,
  onExportCSV,
  onLoadBackup,
  onUploadRoster,
  onResetRoster,
  onLoadPastDate,
  onNewSession,
  isSyncing,
  isLoadingPast,
}) {
  return (
    <div className="pt-6 border-t border-slate-100 space-y-2.5">

      {/* Register Guest */}
      <button
        onClick={onOpenGuestForm}
        className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-3 rounded-xl font-semibold transition-colors border border-indigo-100 text-sm shadow-xs"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Register Guest
      </button>

      {/* Save to Google Sheets */}
      <button
        onClick={onSyncToSheets}
        disabled={isSyncing}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors border text-sm ${
          isSyncing
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-blue-900 text-white hover:bg-blue-950 border-blue-900 shadow-sm'
        }`}
      >
        <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : 'animate-pulse'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {isSyncing ? 'Syncing...' : 'Save to Google Sheets'}
      </button>

      {/* Load Past Date from Sheets */}
      <button
        onClick={onLoadPastDate}
        disabled={isLoadingPast}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors border text-sm ${
          isLoadingPast
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-100 shadow-xs'
        }`}
      >
        <svg className={`w-4 h-4 ${isLoadingPast ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {isLoadingPast ? 'Loading...' : 'Load & Edit Past Date'}
      </button>

      {/* Export CSV Backup */}
      <button
        onClick={onExportCSV}
        className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-3 rounded-xl font-semibold transition-colors border border-emerald-100 text-sm shadow-xs"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export CSV Backup
      </button>

      {/* Load Offline Backup */}
      <label className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-800 hover:bg-amber-100 py-3 rounded-xl font-semibold transition-colors border border-amber-200 text-sm cursor-pointer shadow-xs">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
        </svg>
        Load Offline Backup
        <input type="file" accept=".csv" onChange={onLoadBackup} className="hidden" />
      </label>

      {/* Upload Master Roster */}
      <label className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 rounded-xl font-semibold transition-colors border border-slate-200 text-sm cursor-pointer shadow-xs">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Upload Master Roster
        <input type="file" accept=".csv" onChange={onUploadRoster} className="hidden" />
      </label>

      {/* New Session — clear all attendance */}
      <button
        type="button"
        onClick={onNewSession}
        className="w-full text-center text-xs text-rose-400 hover:text-rose-600 py-1 font-bold transition-colors block border-t border-slate-100 pt-3"
      >
        🗑 New Session (Clear Attendance)
      </button>

      {/* Restore Original Roster */}
      <button
        type="button"
        onClick={onResetRoster}
        className="w-full text-center text-xs text-slate-400 hover:text-rose-500 py-1 font-bold transition-colors block"
      >
        Restore Original Roster
      </button>
    </div>
  );
}
