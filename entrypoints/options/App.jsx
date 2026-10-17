import { useEffect, useRef, useState } from 'react';
import ServiceRow from './ServiceRow.jsx';
import Switch from '@/components/Switch.jsx';
import { usePointerReorder } from '@/hooks/usePointerReorder.js';
import { CloseIcon } from '@/lib/icons.jsx';
import { resolveLang, t as translate } from '@/lib/i18n.js';
import { fileToBallIcon } from '@/lib/image.js';
import { abbrOf, closeOptionsPage, defaultBallIcon, normUrl, readSettings, uid, writeSettings } from '@/lib/storage.js';

/** 服务管理页：增删改、拖动/键盘排序、自动保存（中英文） */
export default function App() {
  const [services, setServices] = useState(null);
  const [hideOnServiceSites, setHideOnServiceSites] = useState(true);
  const [ballIcon, setBallIcon] = useState(null);
  const [ballSnap, setBallSnap] = useState(true);
  const [lang, setLang] = useState('auto');
  const [badIds, setBadIds] = useState([]);
  const [focusId, setFocusId] = useState(null);
  const saveTimer = useRef(0);
  const servicesRef = useRef([]);
  const iconInputRef = useRef(null);

  const t = (key, vars) => translate(resolveLang(lang), key, vars);

  useEffect(() => {
    (async () => {
      const s = await readSettings();
      setServices(s.services || []);
      setHideOnServiceSites(s.hideOnServiceSites !== false);
      setBallIcon(s.ballIcon || null);
      setBallSnap(s.ballSnap !== false);
      setLang(s.lang || 'auto');
    })();
    return () => clearTimeout(saveTimer.current);
  }, []);

  useEffect(() => {
    servicesRef.current = services || [];
  }, [services]);

  const ids = (services || []).map((s) => s.id);

  const save = async () => {
    const cleaned = [];
    const bad = [];
    for (const s of servicesRef.current) {
      const name = (s.name || '').trim();
      const rawUrl = (s.url || '').trim();
      if (!name && !rawUrl) continue; // 完全空行忽略
      const url = normUrl(rawUrl);
      if (!url) {
        bad.push(s.id);
        continue;
      }
      const finalName =
        name ||
        (() => {
          try {
            return new URL(url).hostname;
          } catch {
            return translate(resolveLang(lang), 'common.untitled');
          }
        })();
      cleaned.push({
        ...s,
        name: finalName,
        url,
        color: /^#[0-9a-f]{6}$/i.test(s.color || '') ? s.color : '#6366f1',
        abbr: abbrOf(finalName),
      });
    }
    setBadIds(bad);
    if (bad.length) return; // 有非法网址：本次不保存
    await writeSettings({ services: cleaned });
  };

  const scheduleSave = () => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 500);
  };

  const patch = (id, changes) => {
    setServices((prev) => (prev || []).map((s) => (s.id === id ? { ...s, ...changes } : s)));
    scheduleSave();
  };

  const addService = () => {
    const s = { id: uid(), name: '', url: '', color: '#6366f1', abbr: 'AI' };
    setServices((prev) => [...(prev || []), s]);
    setFocusId(s.id);
    scheduleSave();
  };

  const removeService = (id) => {
    setServices((prev) => (prev || []).filter((s) => s.id !== id));
    scheduleSave();
  };

  const resetServices = async () => {
    if (!confirm(t('options.confirmReset'))) return;
    await chrome.runtime.sendMessage({ type: 'reset-services' });
    const s = await readSettings();
    setServices(s.services || []);
    setBadIds([]);
  };

  const reorder = usePointerReorder({
    ids,
    orientation: 'y',
    onCommit: (nextIds) => {
      const currentIds = servicesRef.current.map((s) => s.id);
      if (nextIds.join('|') === currentIds.join('|')) return; // 顺序未变：不写存储
      const map = new Map(servicesRef.current.map((s) => [s.id, s]));
      const next = nextIds.map((id) => map.get(id)).filter(Boolean);
      if (next.length !== servicesRef.current.length) return;
      setServices(next);
      servicesRef.current = next;
      save();
    },
  });

  /** 关闭设置页：先落盘未保存的编辑，再关掉自身标签页 */
  const closeSelf = async () => {
    clearTimeout(saveTimer.current);
    await save();
    await closeOptionsPage();
  };

  /* ---------- 悬浮球：图标 / 吸附 / 位置 ---------- */
  const pickIcon = () => iconInputRef.current?.click();

  const onIconFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await fileToBallIcon(file, 128);
      setBallIcon(dataUrl);
      writeSettings({ ballIcon: dataUrl });
    } catch (e) {
      alert(e && e.message === 'gif-too-large' ? t('common.gifTooLarge') : t('common.imageFailed'));
    }
  };

  if (!services) return null;

  return (
    <main className="mx-auto max-w-[820px] px-5 pb-16 pt-8 font-sans text-slate-900">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-semibold">
          <img src="/icon/48.png" alt="" className="h-7 w-7" />
          {t('options.title')}
        </h1>
        <button
          type="button"
          onClick={closeSelf}
          title={t('options.closeTitle')}
          aria-label={t('options.closeTitle')}
          className="mt-1 flex h-8 flex-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
        >
          <CloseIcon size={14} />
          {t('common.close')}
        </button>
      </div>
      <p className="mb-4 mt-1 text-[13px] text-slate-500">{t('options.tip')}</p>

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-[15px] font-semibold">{t('options.ballSection')}</h2>

        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
            <img src={ballIcon || defaultBallIcon()} alt="" className="h-full w-full object-cover object-center" />
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={pickIcon}
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs text-white transition hover:bg-indigo-600"
              >
                {t('options.uploadImage')}
              </button>
              {ballIcon && (
                <button
                  type="button"
                  onClick={() => {
                    setBallIcon(null);
                    writeSettings({ ballIcon: null });
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300"
                >
                  {t('options.restoreIcon')}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">{t('options.iconHint')}</p>
          </div>
          <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={onIconFile} />
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <Switch
            checked={ballSnap}
            onChange={(v) => {
              setBallSnap(v);
              writeSettings({ ballSnap: v });
            }}
            label={t('options.snap')}
          />
          <span>{t('options.snapHint')}</span>
        </div>

        <p className="mt-4 text-xs text-slate-400">{t('options.panelSideNote')}</p>
      </section>

      <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm">
        <Switch
          checked={hideOnServiceSites}
          onChange={(v) => {
            setHideOnServiceSites(v);
            writeSettings({ hideOnServiceSites: v });
          }}
          label={t('options.hideOnServiceSites')}
        />
        <span>{t('options.hideOnServiceSites')}</span>
      </label>

      <div ref={reorder.containerRef} className="flex flex-col gap-2">
        {reorder.order.map((id) => {
          const s = (services || []).find((x) => x.id === id);
          if (!s) return null;
          return (
            <ServiceRow
              key={id}
              t={t}
              service={s}
              bad={badIds.includes(id)}
              dragging={reorder.draggingId === id}
              focus={focusId === id}
              reorder={reorder}
              onPatch={patch}
              onRemove={removeService}
              onMoveBy={reorder.moveBy}
            />
          );
        })}
        {!services.length && <p className="text-[13px] text-slate-400">{t('options.empty')}</p>}
      </div>

      {badIds.length > 0 && <p className="mt-2 text-xs text-amber-600">{t('options.badHint')}</p>}

      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={addService}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-[13px] text-white transition hover:bg-indigo-600"
        >
          {t('common.addService')}
        </button>
        <button
          type="button"
          onClick={resetServices}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] text-slate-600 transition hover:border-slate-300"
        >
          {t('common.restoreDefaults')}
        </button>
      </div>

      <p className="mt-6 rounded-lg bg-orange-50 px-3 py-2.5 text-[13px] leading-relaxed text-orange-900">
        {t('options.note')}
      </p>
    </main>
  );
}
