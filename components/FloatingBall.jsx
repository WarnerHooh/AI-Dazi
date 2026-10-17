import { useEffect, useRef, useState } from 'react';
import { SparkIcon } from '@/lib/icons.jsx';
import { t as translate } from '@/lib/i18n.js';
import { defaultBallIcon, getPanelSide, openSidePanel, writeSettings } from '@/lib/storage.js';

const FREE_SIZE = 46; // 自由拖动时的直径
const DOCK_W = 32; // 吸附把手宽度（比圆球稍宽）
const DOCK_H = 34; // 吸附把手高度（比圆球矮）
const SNAP_DISTANCE = 70; // 松手时距侧边小于该值才吸附
const MARGIN = 4; // 自由位置距视口边缘的最小留白

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

/**
 * 页面内的悬浮球：
 * - 点击打开侧边栏（失败时短暂 toast）
 * - 任意拖动；松手时只有靠近左右侧边（<SNAP_DISTANCE）才吸附成贴边小把手，否则停在原地
 * - 吸附开关可关闭；图标可用设置页上传的图片替换（ballIcon）
 */
export default function FloatingBall({ ballPos, ballSnap, ballIcon, lang = 'zh', hidden = false }) {
  const vp = useViewport();
  const [dragPoint, setDragPoint] = useState(null); // 拖动中的视口坐标（px，中心）
  const [toast, setToast] = useState('');
  const [iconBroken, setIconBroken] = useState(false);
  const dragRef = useRef(null);
  const pointRef = useRef(null);
  const toastTimer = useRef(0);
  const lastDragEnd = useRef(0);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const pos = ballPos || null; // 未设置时用右下角默认位置
  const iconSrc = ballIcon || defaultBallIcon();
  const dragging = dragPoint !== null;
  // 拖动过程中一律按自由圆球渲染；松手后才可能变成吸附把手
  const docked = !dragging && ballSnap !== false && pos && (pos.dock === 'left' || pos.dock === 'right') ? pos.dock : null;

  const w = docked ? DOCK_W : FREE_SIZE;
  const h = docked ? DOCK_H : FREE_SIZE;

  // 默认位置：右下角约 100px 处（不吸附）
  const defaultX = vp.w - 100;
  const defaultY = vp.h - 100;

  const centerX = dragging
    ? dragPoint.x
    : docked
      ? docked === 'left'
        ? w / 2
        : vp.w - w / 2
      : clamp(pos ? pos.x * vp.w : defaultX, w / 2 + MARGIN, vp.w - w / 2 - MARGIN);
  const centerY = dragging ? dragPoint.y : clamp(pos ? pos.y * vp.h : defaultY, h / 2 + MARGIN, vp.h - h / 2 - MARGIN);

  const t = (key, vars) => translate(lang, key, vars);

  const flash = (text, ms = 2600) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), ms);
  };

  const open = async () => {
    const [res, panelSide] = await Promise.all([openSidePanel(), getPanelSide()]);
    if (!res || !res.ok) {
      flash(t('ball.openFailed'));
      return;
    }
    // 侧栏位置由浏览器设置决定（扩展不可指定）：若球与侧栏不同侧，提示一下
    const ballSide = docked || (centerX > vp.w / 2 ? 'right' : 'left');
    if (panelSide && panelSide !== ballSide) {
      flash(
        t('ball.panelSide', {
          side: t(panelSide === 'left' ? 'ball.sideLeft' : 'ball.sideRight'),
        }),
        3600,
      );
    }
  };

  /* ---------- 拖动 ---------- */
  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragRef.current = {
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

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4) return;
      d.moved = true;
    }
    e.preventDefault();
    pointRef.current = { x: e.clientX, y: e.clientY };
    setDragPoint(pointRef.current);
  };

  const onPointerUp = (e) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    try {
      d.handle.releasePointerCapture(e.pointerId);
    } catch {
      /* 忽略 */
    }
    const point = pointRef.current;
    pointRef.current = null;
    setDragPoint(null);
    if (!d.moved || !point) return;

    lastDragEnd.current = Date.now();

    const nx = clamp(point.x / vp.w, 0.04, 0.96);
    const ny = clamp(point.y / vp.h, 0.04, 0.96);
    const nearLeft = point.x <= SNAP_DISTANCE;
    const nearRight = point.x >= vp.w - SNAP_DISTANCE;

    if (ballSnap !== false && (nearLeft || nearRight)) {
      // 距侧边足够近：吸附，纵向保持相对位置
      const side = nearLeft ? 'left' : 'right';
      writeSettings({ ballPos: { dock: side, x: side === 'left' ? 0.03 : 0.97, y: ny } });
    } else {
      // 离侧边较远（或已关闭吸附）：保留自由位置
      writeSettings({ ballPos: { dock: null, x: nx, y: ny } });
    }
  };

  const onClick = () => {
    if (Date.now() - lastDragEnd.current < 300) return; // 拖动结束后的 click 不触发打开
    open();
  };

  /* ---------- 样式 ---------- */
  const corner = docked === 'right' ? 'rounded-l-[8px]' : docked === 'left' ? 'rounded-r-[8px]' : 'rounded-full';
  const iconSize = docked ? 18 : 22;
  const toastOnRight = centerX > vp.w / 2;

  return (
    <>
      <button
        type="button"
        title={t('ball.title')}
        aria-label={t('ball.aria')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        style={{
          left: centerX - w / 2,
          top: centerY - h / 2,
          width: w,
          height: h,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 52%, #06b6d4 100%)',
          boxShadow: docked
            ? '0 4px 14px rgba(15, 23, 42, 0.25)'
            : '0 6px 20px rgba(99, 102, 241, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.25)',
        }}
        className={[
          'fixed z-10 flex select-none items-center justify-center overflow-hidden text-white',
          'transition-all duration-200',
          corner,
          dragging ? 'scale-105 cursor-grabbing transition-none' : 'cursor-grab hover:scale-105',
          hidden ? 'pointer-events-none opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        {iconSrc && !iconBroken ? (
          <span className="flex h-full w-full items-center justify-center overflow-hidden">
            <img
              src={iconSrc}
              alt=""
              draggable={false}
              onError={() => setIconBroken(true)}
              className="h-full w-full object-cover object-center"
            />
          </span>
        ) : (
          <SparkIcon size={iconSize} />
        )}
      </button>

      {toast && (
        <div
          role="status"
          className="fixed z-10 max-w-[240px] rounded-lg bg-slate-900/90 px-2.5 py-2 text-xs leading-snug text-white"
          style={{
            left: toastOnRight ? centerX - w / 2 - 10 : centerX + w / 2 + 10,
            top: centerY,
            transform: toastOnRight ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
