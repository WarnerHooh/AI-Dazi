/** 侧栏空态：未配置任何 AI 服务 */
export default function EmptyState({ t, onOpenOptions }) {
  return (
    <div className="p-6 text-[13px] leading-relaxed text-slate-400">
      {t('panel.emptyPrefix')}
      <button type="button" onClick={onOpenOptions} className="text-indigo-500 hover:underline">
        {t('panel.emptyAction')}
      </button>
      {t('panel.emptySuffix')}
    </div>
  );
}
