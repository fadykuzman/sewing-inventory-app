# APK Build & Distribution Guide

## Prerequisites

- Node.js (v18+)
- EAS CLI: `npm install -g eas-cli`
- Expo account: `eas login`
- Android SDK (only needed for local builds)

## One-Time Setup

1. Link the project to EAS:

   ```bash
   cd frontend
   eas build:configure
   ```

2. EAS will generate/manage the Android keystore automatically on first build. To use a custom keystore, run `eas credentials` before building.

## Building the APK

From the project root:

```bash
cd frontend
EXPO_PUBLIC_API_URL=https://sewing.vanillaandcaramel.com/api/v1 eas build --platform android --profile preview --local
```

- `--profile preview` → outputs an `.apk` (not `.aab`)
- `--local` → builds on your machine instead of EAS servers (free, no queue)
- The `EXPO_PUBLIC_API_URL` env var bakes the API URL into the build

The APK will be output to the current directory when the build completes.

## Distribution

### Option 1: Direct Share

Send the `.apk` file directly to family members (email, messaging app, file share). They'll need to enable "Install from unknown sources" on their Android device.

### Option 2: Host on the Server

```bash
scp build-*.apk tinyhome@<server-ip>:/home/tinyhome/Services/sewing/public/
```

Then share the download link: `https://sewing.vanillaandcaramel.com/downloads/sewing-app.apk`

(Requires adding a static file route in Traefik or serving via the backend.)

## Updating the App

1. Rebuild the APK with the same command above
2. Redistribute to family members
3. They install over the existing app (data is server-side, nothing lost)

## Troubleshooting

- **Build fails on missing Android SDK**: Install Android SDK via Android Studio or `sdkmanager`, or remove `--local` to build on EAS servers (requires a paid plan for queue priority)
- **App can't connect to server**: Verify `EXPO_PUBLIC_API_URL` was set correctly during build
- **"Install blocked" on device**: Go to Settings → Security → enable "Unknown sources"
