import { PDCC_LOGO_URL, SOLPG_LOGO_URL } from '../config';

export default function Header({ meetingDate, onDateChange, totalPresent }) {
  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 md:p-8 border-b-2 border-amber-500/40">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

        {/* Logos + Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white p-1.5 md:p-2 rounded-xl shadow-md gap-3 shrink-0">
            <div className="relative">
              <img
                src={PDCC_LOGO_URL}
                alt="PDCC"
                className="h-10 md:h-12 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
              />
              <span className="hidden text-[10px] text-slate-400 font-bold tracking-wider uppercase px-2 py-1 bg-slate-100 rounded">PDCC</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="relative">
              <img
                src={SOLPG_LOGO_URL}
                alt="SOLPG"
                className="h-10 md:h-12 w-auto object-contain rounded-md"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
              />
              <span className="hidden text-[10px] text-slate-400 font-bold tracking-wider uppercase px-2 py-1 bg-slate-100 rounded">SOLPG</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Servants of the Lord
            </h1>
            <p className="text-[10px] md:text-xs text-amber-400 font-bold tracking-widest uppercase">
              Pag-ibig sa Diyos Catholic Community
            </p>
          </div>
        </div>

        {/* Date + Total Count */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-xl w-full md:w-auto justify-between md:justify-start">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Date:</span>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-white px-3 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold"
            />
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-400 w-full md:w-auto justify-center">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Total Present: {totalPresent}
          </div>
        </div>
      </div>
    </div>
  );
}
