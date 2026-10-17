import { serviceById } from '@/lib/storage.js';

/**
 * 侧边栏的 iframe 容器（keep-alive）：
 * - 当前服务可见（z-10），其余用 visibility 隐藏而非 display:none —— 保留布局与状态
 * - 切换服务不会卸载任何 iframe，对话/草稿/滚动位置原样保留
 */
export default function ServiceFrames({ services, activeId, openIds, reloadKeys }) {
  return openIds.map((id) => {
    const s = serviceById(services, id);
    if (!s) return null;
    const active = id === activeId;
    return (
      <iframe
        key={`${id}:${reloadKeys[id] || 0}`}
        src={s.url}
        title={s.name}
        allow="clipboard-write; microphone; camera"
        className={`absolute inset-0 h-full w-full border-0 bg-white ${
          active ? 'visible z-10' : 'invisible z-0 pointer-events-none'
        }`}
      />
    );
  });
}
