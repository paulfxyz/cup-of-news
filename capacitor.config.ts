/**
 * @file capacitor.config.ts
 * @author Paul Fleury <hello@paulfleury.com>
 *
 * Cup of News — Capacitor Native App Configuration
 *
 * This file configures Capacitor for building Cup of News as a native
 * iOS and Android app from the existing React web app.
 *
 * WHY CAPACITOR:
 *   The app is already a React SPA. Capacitor wraps it in a native WebView,
 *   giving access to native device APIs (push notifications, haptics, share,
 *   camera, etc.) while keeping 100% code reuse between web and native.
 *   No React Native rewrite needed. No separate codebase to maintain.
 *
 * HOW TO BUILD:
 *   See NATIVE.md for the complete step-by-step guide.
 *
 *   Quick version:
 *     npm run build                    # build the web app
 *     npx cap sync                     # copy to native projects
 *     npx cap open ios                 # open in Xcode
 *     npx cap open android             # open in Android Studio
 *
 * ALTERNATIVES CONSIDERED:
 *   - React Native: requires rewriting UI components — too costly for a solo project
 *   - Ionic Framework: good choice but adds Ionic UI layer; we already have our own design
 *   - Tauri: desktop only (no mobile), not relevant here
 *   - Expo: great for new React Native projects, not for existing React web apps
 *   - PWA only: works on Android natively, iOS has limitations (no push notifications,
 *     no App Store distribution). Capacitor gives full native distribution.
 */

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Must match app ID in App Store Connect and Google Play Console
  appId: 'news.cupof.app',
  appName: 'Cup of News',

  // Points to the built web app
  webDir: 'dist/public',

  // Server config — for local development with live reload
  // Comment out for production builds
  // server: {
  //   url: 'http://localhost:5000',
  //   cleartext: true,
  // },

  ios: {
    // Minimum iOS version
    minVersion: '15.0',
    // Allow navigation to the app server
    allowsLinkPreview: false,
    // Use WKWebView (default in Capacitor 4+)
    contentInset: 'automatic',
    scrollEnabled: true,
  },

  android: {
    minSdkVersion: 24,  // Android 7.0+
    targetSdkVersion: 34,
    buildToolsVersion: '34.0.0',
    // Allow mixed content for development
    allowMixedContent: false,
  },

  plugins: {
    // Status bar styling — matches our near-black/white design
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f0f0f',
    },

    // Splash screen — red with C logo
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#E3120B',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },

    // Push notifications (for future 6 AM daily digest alert)
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
