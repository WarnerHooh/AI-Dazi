import { useEffect, useState } from 'react';
import { SETTINGS_KEYS, readSettings } from '@/lib/storage.js';

/**
 * 读取扩展设置并订阅 chrome.storage 变化。
 * 首次加载前返回 null，调用方可据此渲染骨架或空态。
 */
export function useSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = () => {
      readSettings().then((s) => {
        if (alive) setSettings(s);
      });
    };

    load();

    const onChanged = (changes, area) => {
      if (area !== 'local') return;
      if (!SETTINGS_KEYS.some((k) => k in changes)) return;
      load();
    };
    chrome.storage.onChanged.addListener(onChanged);

    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(onChanged);
    };
  }, []);

  return [settings, setSettings];
}
