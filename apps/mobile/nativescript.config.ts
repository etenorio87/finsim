import { NativeScriptConfig } from '@nativescript/core';

export default {
  // Provisional: se fija antes de publicar en las tiendas (Fase 7)
  id: 'com.etenorio87.finsim',
  appPath: 'src',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
  },
} as NativeScriptConfig;
