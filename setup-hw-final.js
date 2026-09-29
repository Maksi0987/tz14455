const fs = require("fs");
const path = require("path");

const targetDir = path.join(process.cwd(), "rn-todo-list-v3");

if (!fs.existsSync(targetDir)) {
  console.error("❌ Помилка: Папку rn-todo-list-v3 не знайдено! Переконайся, що запускаєш у кореневій папці.");
  process.exit(1);
}

// 1. app.config.ts
const appConfigContent = `import { ConfigContext, ExpoConfig } from "expo/config";

const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID || "00000000-0000-0000-0000-000000000000";
const PROJECT_SLUG = "rn-todo-list";
const OWNER = "maksi0987";

const APP_NAME = "Todo App";
const BUNDLE_IDENTIFIER = \`com.\${OWNER}.rntodolist\`;
const PACKAGE_NAME = \`com.\${OWNER}.rntodolist\`;
const SCHEME = "rntodolist";

const ICON = "./assets/images/icon.png";
const ADAPTIVE_ICON_FOREGROUND = "./assets/images/android-icon-foreground.png";
const ADAPTIVE_ICON_BACKGROUND = "./assets/images/android-icon-background.png";
const ADAPTIVE_ICON_MONOCHROME = "./assets/images/android-icon-monochrome.png";

export default ({ config }: ConfigContext): ExpoConfig => {
  const environment =
    (process.env.APP_ENV as "development" | "preview" | "production") ||
    "development";

  console.log("⚙️  Building rn-todo-list for environment:", environment);
  console.log("📦 Convex URL:", process.env.EXPO_PUBLIC_CONVEX_URL);

  const dynamicConfig = getDynamicAppConfig(environment);

  return {
    ...config,
    name: dynamicConfig.name,
    slug: PROJECT_SLUG,
    version: "1.0.0",
    orientation: "portrait",
    icon: dynamicConfig.icon,
    scheme: dynamicConfig.scheme,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: dynamicConfig.bundleIdentifier,
      buildNumber: "1",
    },

    android: {
      package: dynamicConfig.packageName,
      versionCode: 1,
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: dynamicConfig.adaptiveIconForeground,
        backgroundImage: dynamicConfig.adaptiveIconBackground,
        monochromeImage: dynamicConfig.adaptiveIconMonochrome,
      },
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    updates: {
      url: \`https://u.expo.dev/\${EAS_PROJECT_ID}\`,
    },
    runtimeVersion: {
      policy: "appVersion",
    },

    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      router: {},
    },

    owner: OWNER,
  };
};

export const getDynamicAppConfig = (
  environment: "development" | "preview" | "production"
) => {
  if (environment === "development") {
    return {
      name: \`\${APP_NAME} Dev\`,
      bundleIdentifier: \`\${BUNDLE_IDENTIFIER}.dev\`,
      packageName: \`\${PACKAGE_NAME}.dev\`,
      icon: "./assets/images/icons/icon-dev.png",
      adaptiveIconForeground:
        "./assets/images/icons/android-icon-foreground-dev.png",
      adaptiveIconBackground: ADAPTIVE_ICON_BACKGROUND,
      adaptiveIconMonochrome: ADAPTIVE_ICON_MONOCHROME,
      scheme: \`\${SCHEME}-dev\`,
    };
  }

  if (environment === "preview") {
    return {
      name: \`\${APP_NAME} Preview\`,
      bundleIdentifier: \`\${BUNDLE_IDENTIFIER}.preview\`,
      packageName: \`\${PACKAGE_NAME}.preview\`,
      icon: "./assets/images/icons/icon-preview.png",
      adaptiveIconForeground:
        "./assets/images/icons/android-icon-foreground-preview.png",
      adaptiveIconBackground: ADAPTIVE_ICON_BACKGROUND,
      adaptiveIconMonochrome: ADAPTIVE_ICON_MONOCHROME,
      scheme: \`\${SCHEME}-preview\`,
    };
  }

  return {
    name: APP_NAME,
    bundleIdentifier: BUNDLE_IDENTIFIER,
    packageName: PACKAGE_NAME,
    icon: ICON,
    adaptiveIconForeground: ADAPTIVE_ICON_FOREGROUND,
    adaptiveIconBackground: ADAPTIVE_ICON_BACKGROUND,
    adaptiveIconMonochrome: ADAPTIVE_ICON_MONOCHROME,
    scheme: SCHEME,
  };
};
`;

fs.writeFileSync(path.join(targetDir, "app.config.ts"), appConfigContent, "utf8");

// 2. eas.json
const easJsonContent = JSON.stringify({
  "cli": {
    "version": ">= 16.28.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "environment": "development",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "environment": "preview",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "environment": "production",
      "channel": "production"
    }
  },
  "submit": {
    "production": {}
  }
}, null, 2);

fs.writeFileSync(path.join(targetDir, "eas.json"), easJsonContent, "utf8");

// 3. Резервна копія app.json -> app.json.backup
const oldAppJson = path.join(targetDir, "app.json");
if (fs.existsSync(oldAppJson)) {
  fs.copyFileSync(oldAppJson, path.join(targetDir, "app.json.backup"));
  fs.unlinkSync(oldAppJson);
}

// 4. Створення папок ікон та заглушок
const iconsDir = path.join(targetDir, "assets", "images", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

// Створюємо порожні placeholder файли іконок, якщо їх немає
const iconFiles = [
  "../icon.png",
  "../android-icon-foreground.png",
  "../android-icon-background.png",
  "../android-icon-monochrome.png",
  "../splash-icon.png",
  "icon-dev.png",
  "android-icon-foreground-dev.png",
  "icon-preview.png",
  "android-icon-foreground-preview.png"
];

const dummyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const dummyBuffer = Buffer.from(dummyPngBase64, "base64");

for (const rel of iconFiles) {
  const p = path.join(iconsDir, rel);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, dummyBuffer);
  }
}

// 5. .env.local
fs.writeFileSync(path.join(targetDir, ".env.local"), "APP_ENV=development\nEXPO_PUBLIC_CONVEX_URL=https://placeholder-url.convex.cloud\n", "utf8");

// 6. README.md для здачі
const readmeContent = `# Todo App 4.0 — Multi-Environment, EAS Build & OTA

Цей проєкт налаштований для професійної мульти-середовищної розробки з використанням **Expo**, **EAS Build**, **EAS Update (OTA)** та хмарного бекенду **Convex**.

---

## 🚀 Налаштовані середовища
- **Development**: \`Todo App Dev\` (\`com.maksi0987.rntodolist.dev\`)
- **Preview**: \`Todo App Preview\` (\`com.maksi0987.rntodolist.preview\`)
- **Production**: \`Todo App\` (\`com.maksi0987.rntodolist\`)

---

## 📦 Посилання на Preview збірку
- **EAS Dashboard Build:** [https://expo.dev/accounts/maksi0987/projects/rn-todo-list/builds](https://expo.dev)

---

## ⚡ Основні команди
\`\`\`bash
# Локальний запуск
npx expo start -c

# Хмарна збірка автономного Preview APK
eas build --platform android --profile preview

# Бездротове OTA оновлення (EAS Update)
eas update --platform all --environment preview --channel preview --message "UI: оновлення"

# Деплой бекенду Convex у Production
npx convex deploy
\`\`\`
`;

fs.writeFileSync(path.join(targetDir, "README.md"), readmeContent, "utf8");

console.log("✅ Успішно! Todo App 4.0 повністю налаштовано в папці rn-todo-list-v3.");
