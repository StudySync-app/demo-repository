Study Sync — Setup Guide

This README documents how to set up the technologies used by this project based on the files in the repository root.

Key technologies found in this project
- Expo (React Native) — managed workflow (expo and related plugins in package.json, app.json)
- TypeScript — tsconfig.json and devDependencies
- Drizzle ORM (SQLite) — drizzle.config.ts and schema at src/db/schema.ts
- Expo SQLite — plugin listed in app.json and dependency expo-sqlite
- Supabase — supabase/ (config.toml + migrations) and @supabase/supabase-js dependency
- EAS (Expo Application Services) — eas.json present
- OpenAI usage — openai dependency (set API key)
- Google Sign-In — @react-native-google-signin plugin and expo plugin entry

Prerequisites
- Node.js (>= 18 recommended) and npm
- Git
- Expo CLI: npm install -g expo-cli (or use npx expo)
- (Optional but recommended) EAS CLI for building: npm install -g eas-cli
- (Optional) Android Studio / Xcode for native builds and emulators
- (Optional) supabase CLI if you want to run or manage the local Supabase instance: https://supabase.com/docs/guides/cli

Quick start (run locally)
1. Clone and install
   - git clone <repo>
   - cd <repo>
   - npm install

2. Configure environment variables
   The app needs credentials for Supabase and OpenAI and (optionally) other 3rd-party services. Common variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for server-side tasks)
   - OPENAI_API_KEY

   Options to supply them:
   - Create a .env file and use a tool like expo-config or react-native-dotenv if the app reads .env.
   - Put secrets into EAS secrets and reference via app.config.js/app.json `extra` when building with EAS.
   - For local quick testing, you can export them into your shell before starting Expo (on Windows PowerShell):
     $env:SUPABASE_URL = 'https://...'
     $env:SUPABASE_ANON_KEY = 'anon-...'
     $env:OPENAI_API_KEY = 'sk-...'

3. Start Expo dev server
   - npm run start
   - To run on Android emulator / device: npm run android
   - To run on iOS simulator / device (macOS): npm run ios
   - For web: npm run web

Type-checking
- Run TypeScript check: npx tsc --noEmit

Drizzle (SQLite) notes
- drizzle.config.ts is configured for SQLite (dialect: "sqlite", driver: "expo") and points at the schema file: ./src/db/schema.ts.
- The schema defines tables such as folders, tasks, notes, media, tags, content_tags and app_settings.
- To generate types or migrations with Drizzle tooling, use drizzle-kit (not included by default). Example (install locally or use npx):
    npm install -D @drizzle-kit/cli  # or use: npx @drizzle-kit/cli <command>
  Example commands (see drizzle-kit docs for exact flags):
    npx drizzle-kit generate:ts --config ./drizzle.config.ts --out ./drizzle
    npx drizzle-kit generate:migration --config ./drizzle.config.ts --name "init"

- The app uses expo-sqlite at runtime; Drizzle's `driver: "expo"` is configured to operate in that environment.

Supabase notes
- The repository includes a supabase/ folder with config.toml and migrations.
- To use the local Supabase CLI (recommended for development):
    1) Install supabase CLI: follow https://supabase.com/docs/guides/cli
    2) Login: supabase login
    3) Link the project (if needed) or initialize: supabase init
    4) Start local stack: supabase start
    5) Apply migrations: supabase db push or supabase migration apply

- To connect the running app to Supabase, set SUPABASE_URL and SUPABASE_ANON_KEY environment variables or configure them in app config.

EAS / Building for production
- eas.json exists in the repo. To build production binaries using EAS:
   1) Install and login: npm install -g eas-cli && eas login
   2) Configure credentials for Android/iOS as EAS prompts
   3) Run: eas build -p android  (or -p ios)

- For dev client usage (native modules), install expo-dev-client and run a dev client build: eas build --profile development --platform android

OpenAI
- The project includes the openai package. Provide OPENAI_API_KEY through environment variables. Keep keys secret and do not commit them.

Google Sign-In
- The project includes @react-native-google-signin/google-signin and lists the plugin in app.json. Follow the official configuration steps for Android (add the google-services JSON or set up OAuth) and iOS (GoogleService-Info.plist and URL schemes). The plugin requires OAuth client IDs configured in Google Cloud Console.

Other notes
- Plugins listed in app.json: expo-sqlite, datetimepicker, expo-audio, expo-video, expo-font, expo-asset, google-signin. These are handled by Expo and may require native configuration when building with EAS.
- If you add native modules or change plugin configuration, remember to rebuild the native app (via eas build or expo prebuild + local run) — changes will not reflect in the basic Expo Go app.

Troubleshooting
- If native build errors occur, run: npx expo prebuild then inspect android/ and ios/ for native config issues.
- If Supabase migrations fail, check supabase/config.toml and the migrations folder content and ensure the CLI version is compatible with the migration files.
- For Drizzle schema issues, ensure TypeScript schema (src/db/schema.ts) compiles and that drizzle-kit (if used) uses the same tsconfig or a transpiled JS version.

Where to look in this repository
- app.json  — Expo app configuration (plugins, app id, splash, icons)
- package.json — scripts and dependencies
- drizzle.config.ts — Drizzle (ORM) configuration
- src/db/schema.ts — Drizzle schema (tables)
- supabase/ — local Supabase config and migrations
- eas.json — EAS build configuration

If any of the above should be expanded into step-by-step scripts, CI config, or example .env files, confirm which target environment (local dev on Android, local dev on iOS, CI build with EAS) and a follow-up README section will be added.
