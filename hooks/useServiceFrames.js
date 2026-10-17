import { useEffect, useState } from 'react';
import { serviceById } from '@/lib/storage.js';

/**
 * 侧边栏的 iframe 缓存（keep-alive）：
 * - 访问过的服务全部保持挂载，切换回来不重新加载、状态（对话/草稿/滚动）不丢
 * - 只隐藏不卸载；服务被删除时才移除对应 iframe
 * - reload() 强制重建当前服务的 iframe（用于清空该服务状态）
 */
export function useServiceFrames(services, activeId) {
  const [openIds, setOpenIds] = useState(() => (activeId ? [activeId] : []));
  const [reloadKeys, setReloadKeys] = useState({});

  // 追加式保持挂载：不淘汰、不重排（避免 iframe 重排引发重载）
  useEffect(() => {
    if (!activeId || !serviceById(services, activeId)) return;
    setOpenIds((prev) => (prev.includes(activeId) ? prev : [...prev, activeId]));
  }, [activeId, services]);

  // 服务被删除时清理对应 iframe
  useEffect(() => {
    const valid = new Set((services || []).map((s) => s.id));
    setOpenIds((prev) => (prev.every((id) => valid.has(id)) ? prev : prev.filter((id) => valid.has(id))));
  }, [services]);

  const reload = () => {
    if (!activeId) return;
    setReloadKeys((prev) => ({ ...prev, [activeId]: (prev[activeId] || 0) + 1 }));
  };

  return { openIds, reloadKeys, reload };
}
