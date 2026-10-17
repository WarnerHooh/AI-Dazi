import { useEffect, useRef } from 'react';
import ServiceDot from '@/components/ServiceDot.jsx';

/** 服务列表行：拖动手柄 + 徽标预览 + 名称/网址/颜色 + 删除 */
export default function ServiceRow({ t, service, bad, dragging, focus, reorder, onPatch, onRemove, onMoveBy }) {
  const nameRef = useRef(null);
  const { begin, move, end } = reorder;

  useEffect(() => {
    if (focus) nameRef.current?.focus();
  }, [focus]);

  const update = (patch) => onPatch(service.id, patch);

  const inputCls =
    'w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25';

  return (
    <div
      data-reorder-id={service.id}
      className={[
        'grid grid-cols-[18px_34px_150px_1fr_40px_26px] items-center gap-2 rounded-lg border bg-white px-2.5 py-2',
        bad ? 'border-red-500 ring-2 ring-red-500/15' : 'border-slate-200',
        dragging ? 'opacity-60' : '',
      ].join(' ')}
    >
      <span
        role="button"
        tabIndex={0}
        title={t('options.dragHandle')}
        aria-label={t('options.dragHandle')}
        onPointerDown={(e) => begin(e, service.id)}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyDown={(e) => {
          if (!e.altKey) return;
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            onMoveBy(service.id, -1);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            onMoveBy(service.id, 1);
          }
        }}
        className="flex h-8 cursor-grab touch-none select-none items-center justify-center rounded-md text-sm text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-indigo-400"
      >
        ⠿
      </span>

      <ServiceDot service={service} size="sm" />

      <input
        ref={nameRef}
        value={service.name || ''}
        onChange={(e) => update({ name: e.target.value })}
        placeholder={t('options.rowName')}
        maxLength={20}
        className={inputCls}
      />
      <input
        value={service.url || ''}
        onChange={(e) => update({ url: e.target.value })}
        placeholder="https://…"
        spellCheck={false}
        className={inputCls}
      />
      <input
        type="color"
        value={service.color || '#6366f1'}
        onChange={(e) => update({ color: e.target.value })}
        title={t('options.rowColor')}
        className="h-8 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
      />
      <button
        type="button"
        onClick={() => onRemove(service.id)}
        title={t('options.rowDelete')}
        className="h-8 text-sm text-slate-400 transition hover:text-red-500"
      >
        ✕
      </button>
    </div>
  );
}
