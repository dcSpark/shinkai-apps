import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shinkai.app',
  appName: 'Shinkai',
  webDir: '../../dist/apps/shinkai-app',
  server: {
    androidScheme: 'https',
    url: process.env.SERVE ? 'http://10.0.2.2:9000' : undefined,
    cleartext: process.env.SERVE ? true : false,
  },
};

export default config;
