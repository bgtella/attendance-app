// Toast notification component
export default function Toast({ notification, onClose }) {
  if (!notification.show) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-lg border transition-all duration-300 max-w-md ${
      notification.type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-rose-50 border-rose-200 text-rose-800'
    }`}>
      <span className="font-medium mr-2">{notification.type === 'success' ? '✅' : '❌'}</span>
      <span className="text-sm font-semibold">{notification.message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-slate-400 hover:text-slate-600 font-bold focus:outline-none"
      >
        &times;
      </button>
    </div>
  );
}
