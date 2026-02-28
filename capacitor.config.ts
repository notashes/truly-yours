import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trulyyours.app',
  appName: 'Truly Yours',
  webDir: 'dist',
  android: {
    backgroundColor: '#FFFBFE',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
