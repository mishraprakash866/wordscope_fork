# WordScope

WordScope is a word search game where players trace hidden words in a letter grid. Words can be placed horizontally, vertically, or diagonally. The app is offline‑first, supports progress saving, daily challenges, and ads for monetization.

## Features
- Multiple mood‑based categories (theme packs)
- Classic Mode (relaxed play)
- Time Mode (countdown pressure)
- Daily Challenge with bonus hint reward
- Hints system for when players get stuck
- Offline play (no Wi‑Fi required)
- Progress saving and resume
- Android AdMob monetization (Interstitial + Rewarded)
- Firebase Analytics + Remote Config for live tuning

## How The Game Works
- Each puzzle generates a letter grid and hides the target words inside it.
- Players drag across the grid to select words in 8 directions.
- Found words highlight on the grid and in the word list.
- Progress is auto‑saved and restored on launch.

## Modes (Difficulty)
- Easy Mode: relaxed play (difficulty 1–3).
- Hard Mode: tougher puzzles + timers (difficulty 3–5). Timer length can be tuned via Remote Config.

## Daily Challenge
- A new daily puzzle is generated based on the current date.
- Completing a daily puzzle awards bonus hints.

## Hints
- Hints reveal a full word from the remaining list.
- Bonus hints are awarded for daily completion or rewarded ads.

## AdMob (Android)
- App ID is set in `android/app/src/main/AndroidManifest.xml`.
- Interstitials show after puzzle completion (frequency controlled by Remote Config).
- Rewarded ads grant bonus hints from the Game screen.

Ad unit IDs are in:
- `src/ads/ads.ts`

## Firebase
Integrated packages:
- `@react-native-firebase/app`
- `@react-native-firebase/analytics`
- `@react-native-firebase/remote-config`

Android:
- `android/app/google-services.json`

iOS:
- Add `GoogleService-Info.plist` to `ios/` and run `bundle exec pod install`

## Remote Config Keys
- `time_multiplier` (number): scales time mode timers
- `daily_hint_reward` (number): bonus hints for daily completion + rewarded ads
- `interstitial_every_n` (number): show interstitial every N completions
- `rewarded_cooldown_seconds` (number): cooldown between rewarded ad taps

## Project Structure
- `App.tsx` navigation setup
- `src/screens/` app screens (Home, Category, Daily, Game)
- `src/components/` UI components
- `src/game/` word search generator logic
- `src/data/` theme packs and puzzle data
- `src/storage/` local persistence (progress + ad counters)
- `src/ads/` ad unit configuration
- `src/config/` Remote Config helpers

## Run The App
Start Metro:
```sh
cd "WordScope"
npm start
```

Android:
```sh
cd "WordScope"
npm run android
```

iOS (first time):
```sh
cd "WordScope/ios"
bundle install
bundle exec pod install
cd ..
npm run ios
```

## Build APK
Debug APK:
```sh
cd "WordScope/android"
./gradlew assembleDebug
```
Output:
`android/app/build/outputs/apk/debug/app-debug.apk`

Release APK:
```sh
cd "WordScope/android"
./gradlew assembleRelease
```
Output:
`android/app/build/outputs/apk/release/app-release.apk`

## Notes
- This project is offline‑first by design; Firebase is used for analytics and remote tuning.
- If the emulator starts but install fails, wait for it to fully boot, then run `adb devices`.

## Tech Stack
- React Native CLI
- Firebase (Analytics + Remote Config)
- AdMob (Google Mobile Ads)
- AsyncStorage for offline state
