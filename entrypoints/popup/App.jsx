import { useEffect, useRef, useState } from 'react';
import SegmentedControl from '@/components/SegmentedControl.jsx';
import Switch from '@/components/Switch.jsx';
import { useI18n } from '@/hooks/useI18n.js';
import { GitHubIcon, SparkIcon } from '@/lib/icons.jsx';
import { fileToBallIcon } from '@/lib/image.js';
import { REPO_URL } from '@/lib/defaults.js';
import { defaultBallIcon, openOptionsPage, writeSettings } from '@/lib/storage.js';

/** 工具栏弹窗：语言切换、站点开关、悬浮球图标上传、吸附开关、打开侧边栏、管理服务 */
export default function App() {
  const { t, settings } = useI18n();
  const [tab, setTab] = useState(null);
  const [url, setUrl] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [current] = await chrome.tabs.query({ active: true, currentWindow: true });
      setTab(current || null);
      try {
        setUrl(current && current.url ? new URL(current.url) : null);
      } catch {
        setUrl(null);
      }
    })();
  }, []);

  if (!settings || !tab) return null;

  const version = chrome.runtime.getManifest().version;
  const supported = !!url && /^(https?|file):$/.test(url.protocol);
  const hostname = url ? url.hostname : '';
  const disabled = settings.disabledHosts || [];
  const siteEnabled = supported && !disabled.includes(hostname);
  const langPref = settings.lang || 'auto';
  const previewIcon = settings.ballIcon || defaultBallIcon();
  const toggleSite = (next) => {
    const set = new Set(disabled);
    if (next) set.delete(hostname);
    else set.add(hostname);
    writeSettings({ disabledHosts: [...set] });
  };

  /* ---------- 悬浮球图标上传 ---------- */
  const pickIcon = () => fileRef.current?.click();

  const onIconFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await fileToBallIcon(file, 128);
      writeSettings({ ballIcon: dataUrl });
    } catch (e) {
      alert(e && e.message === 'gif-too-large' ? t('common.gifTooLarge') : t('common.imageFailed'));
    }
  };

  const openRepo = (e) => {
    e.preventDefault();
    try {
      chrome.tabs.create({ url: REPO_URL });
      window.close();
    } catch {
      window.open(REPO_URL, '_blank');
    }
  };

  const openPanel = async () => {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close();
    } catch (e) {
      alert(t('popup.openFailed') + ((e && e.message) || e));
    }
  };

  return (
    <div className="w-[300px] bg-white font-sans text-slate-900">
      <header className="flex items-center gap-2 border-b border-slate-200 px-3.5 py-3">
        <img src="/icon/32.png" alt="" className="h-[22px] w-[22px]" />
        <b className="text-sm">AI 搭子</b>
        <span className="ml-auto text-xs text-slate-400">v{version}</span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          onClick={openRepo}
          title={t('popup.github')}
          aria-label={t('popup.github')}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <GitHubIcon size={15} />
        </a>
      </header>

      {/* 语言切换：跟随系统 / 中文 / English */}
      <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2">
        <span className="text-[13px] text-slate-700">{t('popup.lang')}</span>
        <SegmentedControl
          value={langPref}
          onChange={(v) => writeSettings({ lang: v })}
          options={[
            { value: 'auto', label: t('popup.lang.auto') },
            { value: 'zh', label: '中' },
            { value: 'en', label: 'EN' },
          ]}
          label={t('popup.lang')}
        />
      </div>

      {!supported ? (
        <p className="px-3.5 py-3 text-[13px] text-red-600">{t('popup.unsupported')}</p>
      ) : (
        <div className="px-3.5 py-3">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-[13px] text-slate-700">{t('popup.siteToggle')}</span>
            <Switch checked={siteEnabled} onChange={toggleSite} label={t('popup.siteToggle')} />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] text-slate-700">{t('popup.ballIcon')}</span>
            <div className="flex items-center gap-1.5">
              <span className="flex h-7 w-7 flex-none items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                {previewIcon ? (
                  <img src={previewIcon} alt="" className="h-full w-full object-cover object-center" />
                ) : (
                  <SparkIcon size={14} className="text-slate-400" />
                )}
              </span>
              <button
                type="button"
                onClick={pickIcon}
                className="rounded-md bg-indigo-500 px-2 py-1 text-xs text-white transition hover:bg-indigo-600"
              >
                {t('common.upload')}
              </button>
              {settings.ballIcon && (
                <button
                  type="button"
                  onClick={() => writeSettings({ ballIcon: null })}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 transition hover:border-slate-300"
                >
                  {t('common.default')}
                </button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onIconFile} />

          <div className="flex items-center justify-between py-3">
            <span className="text-[13px] text-slate-700">{t('popup.snap')}</span>
            <Switch
              checked={settings.ballSnap !== false}
              onChange={(v) => writeSettings({ ballSnap: v })}
              label={t('popup.snap')}
            />
          </div>

          <button
            type="button"
            onClick={openPanel}
            className="mt-1 w-full rounded-lg bg-indigo-500 py-2 text-[13px] text-white transition hover:bg-indigo-600"
          >
            {t('popup.openPanel')}
          </button>
          <button
            type="button"
            onClick={async () => {
              await openOptionsPage();
              window.close();
            }}
            className="mt-2.5 block w-full text-center text-xs text-indigo-500 hover:underline"
          >
            {t('popup.manage')}
          </button>
        </div>
      )}

    </div>
  );
}
