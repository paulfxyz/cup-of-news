# Codemagic CI/CD Setup — Cup of News

This guide covers the **one-time setup** required to build and publish Cup of News
to the App Store (TestFlight) and Google Play (internal track) using
[Codemagic](https://codemagic.io).

The pipeline itself is defined in [`.codemagic.yaml`](./.codemagic.yaml) at the
repo root. It wraps the existing React/Vite web app with Capacitor and produces
native binaries — no React Native rewrite.

| Item        | Value             |
| ----------- | ----------------- |
| App ID      | `news.cupof.app`  |
| App name    | `Cup of News`     |
| Web dir     | `dist/public`     |
| Trigger     | Git tag `v*` (e.g. `v4.4.0`) |

---

## 0. Prerequisites

- An [Apple Developer Program](https://developer.apple.com/programs/) membership (paid).
- A [Google Play Developer](https://play.google.com/console) account (paid, one-time).
- A Codemagic account connected to this GitHub repository.
- The Capacitor native projects. If `ios/` and `android/` are **not** committed,
  the pipeline runs `npx cap add ios` / `npx cap add android` automatically on
  first build. You can also generate them locally once and commit them:
  ```bash
  npm run build
  npx cap add ios
  npx cap add android
  npx cap sync
  ```

---

## 1. Connect the repository

1. In Codemagic, **Add application → GitHub → cup-of-news**.
2. Choose **"I have a codemagic.yaml"** — Codemagic auto-detects `.codemagic.yaml`.
3. Confirm the two workflows appear: `ios-release` and `android-release`.

---

## 2. iOS signing (workflow: `ios-release`)

### 2a. App Store Connect API key (recommended for automatic signing)

1. Go to **App Store Connect → Users and Access → Integrations → App Store Connect API**.
2. Create a key with the **App Manager** role. Download the `.p8` private key
   (you can only download it once).
3. Note the **Issuer ID** and **Key ID**.
4. In Codemagic: **Teams → Integrations → Developer Portal → Connect**, or add
   the key under the app's environment variables.

Create an environment variable **group** named `app_store_connect` containing:

| Variable                              | Description                          |
| ------------------------------------- | ------------------------------------ |
| `APP_STORE_CONNECT_ISSUER_ID`         | Issuer ID from step 3                |
| `APP_STORE_CONNECT_KEY_IDENTIFIER`    | Key ID from step 3                   |
| `APP_STORE_CONNECT_PRIVATE_KEY`       | Contents of the downloaded `.p8` file |

### 2b. Distribution certificate + provisioning profile

Create an environment variable **group** named `ios_signing` containing:

| Variable                    | How to produce it                                                       |
| --------------------------- | ----------------------------------------------------------------------- |
| `CM_CERTIFICATE`            | base64 of your Apple **distribution** certificate (`.p12`)              |
| `CM_CERTIFICATE_PASSWORD`   | the password you set when exporting the `.p12`                          |
| `CM_PROVISIONING_PROFILE`   | base64 of an **App Store** provisioning profile for `news.cupof.app`    |

Encode the files as base64 (mark these variables **Secure** in Codemagic):

```bash
base64 -i distribution.p12 | pbcopy           # → CM_CERTIFICATE
base64 -i cupofnews_appstore.mobileprovision | pbcopy   # → CM_PROVISIONING_PROFILE
```

> **Tip:** Instead of managing the `.p12`/profile manually, you can let Codemagic
> fetch/create them automatically via the App Store Connect API key from 2a
> (`app-store-connect fetch-signing-files`). The `.codemagic.yaml` is written to
> work with explicitly-supplied credentials, which is the most portable approach.

### 2c. Register the app in App Store Connect

Create the app record with bundle ID `news.cupof.app` so TestFlight uploads have
a destination. The first TestFlight build may require manual export-compliance
answers in the App Store Connect UI.

---

## 3. Android signing (workflow: `android-release`)

### 3a. Generate an upload keystore (once)

```bash
keytool -genkey -v \
  -keystore cupofnews-upload.keystore \
  -alias cupofnews \
  -keyalg RSA -keysize 2048 -validity 10000
```

Keep this keystore safe — losing it means you cannot push updates under the same
app signing identity (unless you use Play App Signing, which is recommended).

### 3b. Environment variable group `android_signing`

| Variable                | Value                                              |
| ----------------------- | -------------------------------------------------- |
| `CM_KEYSTORE`           | base64 of `cupofnews-upload.keystore` (Secure)     |
| `CM_KEY_ALIAS`          | `cupofnews` (the alias from `keytool`)             |
| `CM_KEY_PASSWORD`       | the key password (Secure)                          |
| `CM_KEYSTORE_PASSWORD`  | the keystore/store password (Secure)               |

Encode the keystore:

```bash
base64 -i cupofnews-upload.keystore | pbcopy   # → CM_KEYSTORE
```

### 3c. Wire signing into Gradle

Ensure `android/app/build.gradle` reads from `android/key.properties` (which the
pipeline writes from the env vars). A standard block:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

> The pipeline also passes the signing values as Gradle `-Pandroid.injected.signing.*`
> properties, so an unmodified Capacitor project will still produce a signed AAB.

### 3d. Google Play service account

1. In **Google Play Console → Setup → API access**, link a Google Cloud project.
2. Create a **service account**, grant it **Release manager** permissions for the app.
3. Download the JSON key.
4. Add an environment variable group `google_play` with:

| Variable                              | Value                              |
| ------------------------------------- | ---------------------------------- |
| `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`  | the full service-account JSON (Secure) |

5. Upload a first build to the **internal** track manually once (Play requires an
   initial manual upload before the API can publish to a track).

---

## 4. Environment variable groups summary

Create these groups in **Codemagic → App settings → Environment variables**, then
reference them (already wired in `.codemagic.yaml`):

| Group                 | Used by           | Contains                                                                 |
| --------------------- | ----------------- | ----------------------------------------------------------------------- |
| `ios_signing`         | `ios-release`     | `CM_CERTIFICATE`, `CM_CERTIFICATE_PASSWORD`, `CM_PROVISIONING_PROFILE`   |
| `app_store_connect`   | `ios-release`     | `APP_STORE_CONNECT_ISSUER_ID`, `_KEY_IDENTIFIER`, `_PRIVATE_KEY`         |
| `android_signing`     | `android-release` | `CM_KEYSTORE`, `CM_KEY_ALIAS`, `CM_KEY_PASSWORD`, `CM_KEYSTORE_PASSWORD` |
| `google_play`         | `android-release` | `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`                                     |

Mark **every** credential variable as **Secure**.

---

## 5. Releasing

The build is triggered by pushing a **version tag**:

```bash
git tag v4.4.0
git push origin v4.4.0
```

- `ios-release` builds a signed IPA and uploads it to **TestFlight**.
- `android-release` builds a signed AAB and publishes it to the Google Play
  **internal** testing track.
- Both workflows email build status (success **and** failure) to
  **hello@paulfleury.com**.

Promotion to the public App Store / Play production track is left **manual** on
purpose — review the build in TestFlight / Play Console, then promote.

---

## 6. Troubleshooting

| Symptom                                   | Likely cause / fix                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `No matching provisioning profiles found` | `CM_PROVISIONING_PROFILE` is for the wrong bundle id or is a dev profile. |
| `Code signing identity not found`         | `CM_CERTIFICATE` is not a **distribution** cert, or password is wrong.    |
| `You must upload a build manually first`  | First Play upload must be done by hand before the API can publish.        |
| `Keystore was tampered with`              | Wrong `CM_KEYSTORE_PASSWORD` / `CM_KEY_PASSWORD`.                         |
| `dist/public not found`                   | `npm run build` failed — check the web build logs earlier in the run.     |
| Build not triggering on tag               | Confirm the tag matches `v*` and the webhook is connected in Codemagic.   |
