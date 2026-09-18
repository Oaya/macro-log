# macro-log mobile

React Native (Expo) client for MacroLog — a fitness and nutrition tracker. Log meals and workouts, and track calories and macros against daily goals. Talks to the [`backend`](../backend) GraphQL API.

## Stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing)
- React Native, TypeScript
- [Apollo Client](https://www.apollographql.com/docs/react) for GraphQL
- Native CSS (`global.css`) for shared design tokens

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure the API URL

   ```bash
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_API_URL` to point at a running instance of the [`backend`](../backend) GraphQL API (e.g. `http://localhost:8000/graphql`).

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Project structure

- `src/app/` - screens and layouts (Expo Router file-based routing)
- `src/components/` - shared UI components
- `src/graphql/` - GraphQL queries/mutations, grouped by feature
- `src/lib/` - Apollo client, auth, and other app-level utilities
- `src/hooks/`, `src/styles/`, `src/constants/` - theming and shared hooks/styles

## Scripts

- `npm run android` / `npm run ios` / `npm run web` - run on a platform
- `npm run lint` - lint with `expo lint`
- `npm run typecheck` - type-check with `tsc --noEmit`
- `npm run reset-project` - move the starter code aside and start from a blank `app` directory (see Expo's docs)

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
- [Apollo Client docs](https://www.apollographql.com/docs/react)
