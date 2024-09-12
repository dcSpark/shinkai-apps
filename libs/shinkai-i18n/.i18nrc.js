const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
  entry: 'locales/en-US.json',
  entryLocale: 'en-US',
  output: 'locales',
  outputLocales: ['zh-CN', 'ja-JP', 'es-ES', 'id-ID'],
  temperature: 0,
  modelName: 'gpt-4o-mini',
  splitToken: 2048,
  experimental: {
    jsonMode: true,
  },
});
