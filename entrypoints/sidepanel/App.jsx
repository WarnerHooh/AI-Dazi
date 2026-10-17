import { useMemo } from 'react';
import EmptyState from '@/components/EmptyState.jsx';
import ServiceFrames from '@/components/ServiceFrames.jsx';
import ServiceTabs from '@/components/ServiceTabs.jsx';
import { usePanelStateReport } from '@/hooks/usePanelStateReport.js';
import { usePointerReorder } from '@/hooks/usePointerReorder.js';
import { useServiceFrames } from '@/hooks/useServiceFrames.js';
import { useI18n } from '@/hooks/useI18n.js';
import { openOptionsPage, serviceById, writeSettings } from '@/lib/storage.js';

/** 侧边栏：跨标签页保持会话的 AI 面板（每窗口一个实例） */
export default function App() {
  const { t, settings } = useI18n();
  usePanelStateReport();

  const services = settings?.services || [];
  const activeId = serviceById(services, settings?.activeServiceId)
    ? settings.activeServiceId
    : services[0]?.id || null;

  const ids = useMemo(() => services.map((s) => s.id), [services]);

  const reorder = usePointerReorder({
    ids,
    orientation: 'x',
    onCommit: (nextIds) => {
      if (nextIds.join('|') === ids.join('|')) return; // 顺序未变：不写存储
      const map = new Map(services.map((s) => [s.id, s]));
      const next = nextIds.map((id) => map.get(id)).filter(Boolean);
      if (next.length === services.length) writeSettings({ services: next });
    },
  });

  const frames = useServiceFrames(services, activeId);

  if (!settings) return null;

  const active = serviceById(services, activeId);
  const openOptions = () => openOptionsPage();

  return (
    <div className="flex h-screen flex-col bg-white font-sans text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <ServiceTabs
        services={services}
        activeId={activeId}
        reorder={reorder}
        t={t}
        onSelect={(id) => writeSettings({ activeServiceId: id })}
        onReload={frames.reload}
        onOpenTab={() => active && window.open(active.url, '_blank', 'noopener')}
        onOptions={openOptions}
      />

      <div className="relative min-h-0 flex-1 bg-white dark:bg-slate-900">
        {services.length ? (
          <ServiceFrames
            services={services}
            activeId={activeId}
            openIds={frames.openIds}
            reloadKeys={frames.reloadKeys}
          />
        ) : (
          <EmptyState t={t} onOpenOptions={openOptions} />
        )}
      </div>
    </div>
  );
}
