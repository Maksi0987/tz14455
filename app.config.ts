import { ConfigContext, ExpoConfig } from "expo/config";

const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID || "00000000-0000-0000-0000-000000000000";
const PROJECT_SLUG = "card-games";
const OWNER = "maksi0987";
const APP_NAME = "Card Games";
const BUNDLE_IDENTIFIER = `com.${OWNER}.cardgames`;
const PACKAGE_NAME = `com.${OWNER}.cardgames`;
const SCHEME = "cardgames";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: APP_NAME,
    slug: PROJECT_SLUG,
    version: "1.0.0",
    orientation: "portrait",
    scheme: SCHEME,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      buildNumber: "1",
    },
    android: {
      package: PACKAGE_NAME,
      versionCode: 1,
    },
    plugins: [
      "expo-secure-store",
      "expo-router",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: false,
    },
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    },
    owner: OWNER,
  };
};
