# Todo App 4.0 — Multi-Environment, EAS Build & OTA

Цей проєкт налаштований для професійної мульти-середовищної розробки з використанням **Expo**, **EAS Build**, **EAS Update (OTA)** та хмарного бекенду **Convex**.

---

## 🚀 Налаштовані середовища
- **Development**: `Todo App Dev` (`com.maksi0987.rntodolist.dev`)
- **Preview**: `Todo App Preview` (`com.maksi0987.rntodolist.preview`)
- **Production**: `Todo App` (`com.maksi0987.rntodolist`)

---

## 📦 Посилання на Preview збірку
- **EAS Dashboard Build:** [https://expo.dev/accounts/maksi0987/projects/rn-todo-list/builds](https://expo.dev)

---

## ⚡ Основні команди
```bash
# Локальний запуск
npx expo start -c

# Хмарна збірка автономного Preview APK
eas build --platform android --profile preview

# Бездротове OTA оновлення (EAS Update)
eas update --platform all --environment preview --channel preview --message "UI: оновлення"

# Деплой бекенду Convex у Production
npx convex deploy
```
