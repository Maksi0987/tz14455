import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export default function Header({ totalCount, completedCount }: { totalCount: number; completedCount: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>📝 Мій Список Завдань</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {totalCount > 0 ? `Виконано ${completedCount} з ${totalCount} завдань` : "Додайте своє перше завдання"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 14, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14 },
});
