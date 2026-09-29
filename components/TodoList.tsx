import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import type { Todo } from "@/types";
import TodoItem from "./TodoItem";

export default function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
}: {
  todos: Todo[];
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, text: string) => Promise<void>;
}) {
  const { colors } = useTheme();

  if (todos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: colors.textMuted }}>Список завдань порожній. Додайте нове завдання!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <TodoItem todo={item} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 },
});
