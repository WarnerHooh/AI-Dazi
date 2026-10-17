import { useSettings } from './useSettings.js';
import { resolveLang, t as translate } from '@/lib/i18n.js';

/** 读取语言偏好 + 提供 t()；设置变化（含切换语言）会自动重渲染 */
export function useI18n() {
  const [settings] = useSettings();
  const lang = resolveLang(settings?.lang);
  return {
    settings,
    lang,
    t: (key, vars) => translate(lang, key, vars),
  };
}
