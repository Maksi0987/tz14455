import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const user = useQuery(api.users.currentUser);
  const clearCompleted = useMutation(api.todos.clearCompleted);
  const clearAll = useMutation(api.todos.clearAll);

  const handleSignOut = () => {
    Alert.alert("Вихід з акаунта", "Ви впевнені, що хочете вийти з додатку?", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Вийти",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/sign-in");
        },
      },
    ]);
  };

  const handleClearCompleted = () => {
    Alert.alert("Очистити виконані", "Видалити всі завершені справи?", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Видалити",
        style: "destructive",
        onPress: async () => {
          const res = await clearCompleted();
          Alert.alert("Готово", `Видалено ${res?.deletedCount ?? 0} завдань`);
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert("Видалити всі завдання", "Очистити абсолютно всі ваші завдання?", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Видалити все",
        style: "destructive",
        onPress: async () => {
          const res = await clearAll();
          Alert.alert("Готово", `Базу очищено. Видалено ${res?.deletedCount ?? 0} завдань`);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: colors.text, marginBottom: 20 }}>
          ⚙️ Налаштування
        </Text>

        {/* Профіль користувача */}
        <View
          style={[
            styles.userCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="person" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name ?? "Користувач"}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>
              {user?.email ?? ""}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="logout" size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.textMuted, marginTop: 20, marginBottom: 8 }}>
          ОФОРМЛЕННЯ
        </Text>
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 16, color: colors.text }}>Темна тема</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>

        <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.textMuted, marginTop: 20, marginBottom: 8 }}>
          КЕРУВАННЯ ДАНИМИ
        </Text>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 10 }]}
          onPress={handleClearCompleted}
        >
          <Text style={{ color: colors.text, fontSize: 15 }}>🧹 Очистити виконані завдання</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.danger }]}
          onPress={handleClearAll}
        >
          <Text style={{ color: colors.danger, fontSize: 15, fontWeight: "600" }}>
            🗑️ Видалити абсолютно всі завдання
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
  },
  userEmail: {
    fontSize: 13,
  },
  signOutBtn: {
    padding: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
