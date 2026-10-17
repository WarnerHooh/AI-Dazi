/** 圆形服务徽标：颜色 + 缩写，可选激活/拖动状态 */
export default function ServiceDot({ service, size = 'md', active = false, dragging = false, className = '' }) {
  const dims = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-[30px] w-[30px] text-[11px]';

  return (
    <span
      className={[
        'flex flex-none items-center justify-center rounded-full border-2 font-bold leading-none text-white',
        dims,
        active ? 'border-indigo-500' : 'border-transparent',
        dragging ? 'scale-110 shadow-lg' : '',
        className,
      ].join(' ')}
      style={{ backgroundColor: service.color || '#6366f1' }}
    >
      {service.abbr || (service.name || 'AI').slice(0, 2)}
    </span>
  );
}
