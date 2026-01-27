import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.petwalk.app',
    appName: 'PetWalk',
    webDir: 'public',
    server: {
        url: 'http://192.168.0.112:3000',
        cleartext: true
    }
};

export default config;
