import { NativeScriptConfig } from '@nativescript/core';

export default {
  // Identificador en App Store y Google Play: no se puede cambiar una vez publicada
  id: 'com.etenoriod.finsim',
  appPath: 'src',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
  },
} as NativeScriptConfig;
