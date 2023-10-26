import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shinkai.app',
  appName: 'Shinkai',
  webDir: '../../dist/apps/shinkai-app',
  server: {
    androidScheme: 'https'
  }
};

export default config;
