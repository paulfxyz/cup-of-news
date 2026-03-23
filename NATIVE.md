# 📱 Native App Guide — Cup of News

This guide explains how to build Cup of News as a native iOS and Android app using **Capacitor**.

---

## Why Capacitor?

Cup of News is a React SPA. Capacitor wraps your existing web app in a native WebView — same code, native distribution. No rewrite.

| Approach | Code reuse | App Store | Push notifications | Effort |
|----------|-----------|-----------|-------------------|--------|
| **Capacitor** (chosen) | 100% | ✅ iOS + Android | ✅ | Low |
| React Native | 0% (full rewrite) | ✅ | ✅ | Very high |
| Ionic | ~80% (Ionic UI) | ✅ | ✅ | Medium |
| PWA only | 100% | ❌ iOS App Store | ❌ iOS | Zero |
| Tauri | 100% | ❌ Desktop only | — | Low |

---

## Prerequisites

```bash
# Node.js 20+, npm 10+
node --version

# Xcode 15+ (iOS) — Mac only
xcode-select --install

# Android Studio (Android)
# Download from: https://developer.android.com/studio

# Capacitor CLI
npm install -g @capacitor/cli
```

---

## Initial Setup (one-time)

```bash
# 1. Install Capacitor packages
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/push-notifications

# 2. Build the web app
npm run build

# 3. Add native platforms
npx cap add ios
npx cap add android

# 4. Sync web assets to native projects
npx cap sync
```

---

## Daily Development Workflow

```bash
# Build web app
npm run build

# Sync to native projects
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio (Android)
npx cap open android
```

---

## Live Reload (Development)

For faster iteration — the app loads from your local dev server instead of the built bundle:

```bash
# 1. Start dev server
npm run dev
# → http://localhost:5000

# 2. Edit capacitor.config.ts — uncomment the server block:
# server: {
#   url: 'http://192.168.x.x:5000',  ← use your machine's LAN IP, not localhost
#   cleartext: true,
# },

# 3. Sync and run
npx cap sync
npx cap open ios
# In Xcode: Run on simulator or device
```

---

## Building for Production

### iOS

1. Open Xcode: `npx cap open ios`
2. Select your Apple Developer account in **Signing & Capabilities**
3. Set Bundle Identifier to `news.cupof.app`
4. **Product → Archive**
5. Upload to App Store Connect via the Organizer

### Android

1. Open Android Studio: `npx cap open android`
2. **Build → Generate Signed Bundle / APK**
3. Create or use your keystore
4. Build a release AAB (Android App Bundle)
5. Upload to Google Play Console

---

## App Store Preparation

### App Store (iOS)

- **Bundle ID:** `news.cupof.app`
- **App Name:** Cup of News
- **Category:** News
- **Age Rating:** 4+
- **Required screenshots:** 6.7" iPhone, 12.9" iPad

### Google Play (Android)

- **Package:** `news.cupof.app`
- **App Name:** Cup of News
- **Category:** News & Magazines
- **Content Rating:** Everyone

---

## Native Features to Add

Once the base app is in the stores, these Capacitor plugins add native capabilities:

```bash
# Daily 6 AM push notification when digest is published
npm install @capacitor/push-notifications

# Share stories to social, iMessage, etc.
npm install @capacitor/share

# Haptic feedback on swipe
npm install @capacitor/haptics

# Biometric lock for admin panel (FaceID / fingerprint)
npm install @capacitor/biometrics

# Background fetch to pre-load digest before user opens app
npm install @capacitor-community/background-fetch
```

---

## How the Architecture Works with Native

```
┌─────────────────────────────────────────┐
│  Native Shell (iOS / Android)            │
│  ┌─────────────────────────────────────┐│
│  │  WKWebView / WebView                ││
│  │  ┌───────────────────────────────┐  ││
│  │  │  React SPA (DigestView, etc.) │  ││
│  │  │  ← same code as web app       │  ││
│  │  └───────────────────────────────┘  ││
│  │           ↕ Capacitor Bridge         ││
│  └─────────────────────────────────────┘│
│  Native APIs: Push, Haptics, Share       │
└─────────────────────────────────────────┘
              ↕ HTTPS API calls
┌─────────────────────────────────────────┐
│  app.cupof.news (Fly.io)                 │
│  Express backend + SQLite               │
└─────────────────────────────────────────┘
```

The React app calls `https://app.cupof.news/api/...` from inside the native WebView — same as the web version. No code changes needed for the API integration.

---

## Important: Deep Links

For the native app to open links within the app (instead of the browser), configure deep links:

**iOS** (`ios/App/App/Info.plist`):
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array><string>cupofnews</string></array>
  </dict>
</array>
```

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="app.cupof.news" />
</intent-filter>
```

---

*For questions: [github.com/paulfxyz/cup-of-news/issues](https://github.com/paulfxyz/cup-of-news/issues)*
