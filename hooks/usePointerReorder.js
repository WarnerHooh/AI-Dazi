import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 5; // 指针位移（勾股距离）超过该值才视为拖动，否则按点击处理

/**
 * 指针拖动排序（横向徽标 / 纵向列表通用）。
 *
 * 提供：
 * - draggingId：正在拖动的 id（用于占位/高亮）
 * - dragPoint：拖动中指针的视口坐标（用于渲染跟手幽灵元素）
 * - order：当前预览顺序（拖动中实时更新，松手后回调）
 *
 * @param {object}   options
 * @param {string[]} options.ids          外部数据的顺序（变化时自动同步，拖动中不打扰）
 * @param {'x'|'y'}  options.orientation  排序轴：横向或纵向
 * @param {(nextIds: string[]) => void} options.onCommit 拖动/键盘排序结束后按新顺序回调
 */
export function usePointerReorder({ ids, orientation = 'x', onCommit }) {
  const [order, setOrder] = useState(ids);
  const [draggingId, setDraggingId] = useState(null);
  const [dragPoint, setDragPoint] = useState(null);
  const containerRef = useRef(null);
  const orderRef = useRef(ids);
  const dragRef = useRef(null);
  const lastDragEndRef = useRef(0);

  const applyOrder = (next) => {
    orderRef.current = next;
    setOrder(next);
  };

  // 外部数据变化（增删/改名/其他窗口排序）时同步本地顺序
  const signature = ids.join('|');
  useEffect(() => {
    if (dragRef.current) return; // 拖动中保持用户操作
    applyOrder(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const begin = (e, id) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragRef.current = {
      id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      handle: e.currentTarget,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* 忽略 */
    }
  };

  const move = (e) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;

    if (!d.moved) {
      const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
      if (dist < THRESHOLD) return;
      d.moved = true;
      setDraggingId(d.id);
    }
    e.preventDefault();
    setDragPoint({ x: e.clientX, y: e.clientY });

    const box = containerRef.current;
    if (!box) return;

    const pos = orientation === 'x' ? e.clientX : e.clientY;
    let beforeId = null;
    for (const el of box.querySelectorAll('[data-reorder-id]')) {
      const id = el.dataset.reorderId;
      if (!id || id === d.id) continue;
      const r = el.getBoundingClientRect();
      const mid = orientation === 'x' ? r.left + r.width / 2 : r.top + r.height / 2;
      if (pos < mid) {
        beforeId = id;
        break;
      }
    }

    const current = orderRef.current;
    const next = current.filter((x) => x !== d.id);
    const at = beforeId ? next.indexOf(beforeId) : next.length;
    next.splice(at < 0 ? next.length : at, 0, d.id);
    if (next.join('|') !== current.join('|')) applyOrder(next);
  };

  const end = (e) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDraggingId(null);
    setDragPoint(null);
    try {
      d.handle.releasePointerCapture(e.pointerId);
    } catch {
      /* 忽略 */
    }
    if (d.moved) {
      lastDragEndRef.current = Date.now();
      onCommit?.(orderRef.current);
    }
  };

  /** 键盘排序：把 id 移动 delta 格（-1 上移 / +1 下移） */
  const moveBy = (id, delta) => {
    const current = orderRef.current;
    const from = current.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= current.length) return;
    const next = [...current];
    next.splice(from, 1);
    next.splice(to, 0, id);
    applyOrder(next);
    onCommit?.(next);
  };

  /** 拖动刚结束时 click 紧随其后触发，用于避免误切换 */
  const shouldSuppressClick = () => Date.now() - lastDragEndRef.current < 300;

  return {
    containerRef,
    order,
    draggingId,
    dragPoint,
    begin,
    move,
    end,
    moveBy,
    shouldSuppressClick,
  };
}
