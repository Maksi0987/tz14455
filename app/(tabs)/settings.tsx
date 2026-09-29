import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const clearCompleted = useMutation(api.todos.clearCompleted);
  const clearAll = useMutation(api.todos.clearAll);

  const onClearCompleted = () => {
    Alert.alert("Очистити виконані", "Видалити всі завершені?", [
      { text: "Скасувати", style: "cancel" },
      { text: "Видалити", style: "destructive", onPress: async () => { const r = await clearCompleted(); Alert.alert("Готово", `Видалено ${r.deletedCount}`); } },
    ]);
  };

  const onClearAll = () => {
    Alert.alert("Видалити ВСЕ", "Очистити всі завдання з хмари?", [
      { text: "Скасувати", style: "cancel" },
      { text: "Видалити все", style: "destructive", onPress: async () => { const r = await clearAll(); Alert.alert("Готово", `Базу очищено. Видалено ${r.deletedCount}`); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: colors.text, marginBottom: 20 }}>⚙️ Налаштування</Text>

        <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.textMuted, marginBottom: 8 }}>ОФОРМЛЕННЯ</Text>
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 16, color: colors.text }}>Темна тема</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>

        <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.textMuted, marginTop: 20, marginBottom: 8 }}>КЕРУВАННЯ ХМАРОЮ CONVEX</Text>
        <TouchableOpacity style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 10 }]} onPress={onClearCompleted}>
          <Text style={{ color: colors.text, fontSize: 15 }}>🧹 Очистити виконані завдання</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.danger }]} onPress={onClearAll}>
          <Text style={{ color: colors.danger, fontSize: 15, fontWeight: "600" }}>🗑️ Видалити абсолютно всі завдання</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1 },
});
