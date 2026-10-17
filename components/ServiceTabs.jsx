import ServiceDot from './ServiceDot.jsx';
import { OpenIcon, ReloadIcon, SettingsIcon } from '@/lib/icons.jsx';

function ToolButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

/** 侧边栏顶栏：可拖动排序的服务徽标 + 工具按钮 */
export default function ServiceTabs({ services, activeId, reorder, onSelect, onReload, onOpenTab, onOptions, t }) {
  const { containerRef, order, draggingId, dragPoint, begin, move, end, shouldSuppressClick } = reorder;
  const map = new Map(services.map((s) => [s.id, s]));
  const draggingService = draggingId ? map.get(draggingId) : null;

  return (
    <header
      className={`relative flex h-[46px] flex-none items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-800 dark:bg-slate-900 ${
        draggingId ? 'cursor-grabbing select-none' : ''
      }`}
    >
      <div
        ref={containerRef}
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-0.5 py-0.5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      >
        {order.map((id) => {
          const s = map.get(id);
          if (!s) return null;
          const isDragging = draggingId === id;
          return (
            <button
              key={id}
              type="button"
              data-reorder-id={id}
              title={t('panel.tabTitle', { name: s.name })}
              aria-label={s.name}
              onPointerDown={(e) => begin(e, id)}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
              onClick={() => {
                if (shouldSuppressClick()) return;
                onSelect(id);
              }}
              className={[
                'flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full touch-none transition',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
                !isDragging && id !== activeId ? 'opacity-75 hover:opacity-100' : 'opacity-100',
              ].join(' ')}
            >
              {isDragging ? (
                /* 拖动占位：虚线圆 + 空槽 */
                <span className="block h-[30px] w-[30px] rounded-full border-2 border-dashed border-slate-400/70 bg-slate-200/40" />
              ) : (
                <ServiceDot service={s} active={id === activeId} />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-none items-center gap-0.5">
        <ToolButton title={t('panel.reload')} onClick={onReload}>
          <ReloadIcon size={15} />
        </ToolButton>
        <ToolButton title={t('panel.openTab')} onClick={onOpenTab}>
          <OpenIcon size={15} />
        </ToolButton>
        <ToolButton title={t('panel.manage')} onClick={onOptions}>
          <SettingsIcon size={15} />
        </ToolButton>
      </div>

      {/* 跟手幽灵：拖动中的徽标跟随指针，带放大与投影 */}
      {draggingService && dragPoint && (
        <div
          className="pointer-events-none fixed z-[2147483647]"
          style={{ left: dragPoint.x, top: dragPoint.y }}
        >
          <div className="-translate-x-1/2 -translate-y-1/2 scale-125 shadow-xl">
            <ServiceDot service={draggingService} className="shadow-xl" />
          </div>
        </div>
      )}
    </header>
  );
}
