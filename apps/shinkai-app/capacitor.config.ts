import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.dcspark.shinkai',
  appName: 'ShinkaiApp',
  webDir: '../../dist/apps/shinkai-app',
  server: {
    androidScheme: 'https'
  }
};

export default config;
