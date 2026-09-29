import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/context/ThemeContext";

export default function StatsScreen() {
  const { colors } = useTheme();
  const stats = useQuery(api.todos.getStats);

  if (stats === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: colors.text, marginBottom: 16 }}>📊 Статистика</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="list" size={26} color={colors.primary} />
            <Text style={[styles.num, { color: colors.text }]}>{stats.total}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Всього завдань</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="time" size={26} color="#F59E0B" />
            <Text style={[styles.num, { color: colors.text }]}>{stats.active}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>В процесі</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="checkmark-done-circle" size={26} color={colors.success} />
            <Text style={[styles.num, { color: colors.text }]}>{stats.completed}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Виконано</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="trending-up" size={26} color="#8B5CF6" />
            <Text style={[styles.num, { color: colors.text }]}>{stats.percentage}%</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Прогрес</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { width: "48%", padding: 16, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  num: { fontSize: 24, fontWeight: "bold" },
});
