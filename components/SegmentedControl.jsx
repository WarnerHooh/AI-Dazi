/** 分段控件（受控）：语言切换、二选一等 */
export default function SegmentedControl({ value, options, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex overflow-hidden rounded-lg border border-slate-200">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 text-xs transition ${
            value === o.value ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
