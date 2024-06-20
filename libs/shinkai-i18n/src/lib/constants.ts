export const locales = ['en-US', 'es-ES', 'ja-JP', 'zh-CN', 'id-ID'] as const;

export type Locales = (typeof locales)[number];

export const normalizeLocale = (locale?: string): string => {
  if (!locale) return 'en-US';

  for (const l of locales) {
    if (l.startsWith(locale)) {
      return l;
    }
  }

  return 'en-US';
};

type LocaleOptions = {
  label: string;
  value: Locales;
}[];

export const localeOptions: LocaleOptions = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: '日本語',
    value: 'ja-JP',
  },
  {
    label: 'Bahasa Indonesia',
    value: 'id-ID',
  },
  {
    label: 'Español',
    value: 'es-ES',
  },
] as LocaleOptions;
