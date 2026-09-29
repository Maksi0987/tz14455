import React from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/context/ThemeContext";
import Header from "@/components/Header";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";

export default function TodosScreen() {
  const { colors } = useTheme();
  const todos = useQuery(api.todos.getTodos);

  const addTodo = useMutation(api.todos.createTodo);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const updateTodo = useMutation(api.todos.updateTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <Header totalCount={todos?.length ?? 0} completedCount={todos?.filter((t) => t.isCompleted).length ?? 0} />
      <TodoForm onAdd={async (text) => { await addTodo({ text }); }} />
      {todos === undefined ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.textMuted }}>Синхронізація з Convex...</Text>
        </View>
      ) : (
        <TodoList
          todos={todos}
          onToggle={async (id) => { await toggleTodo({ id: id as any }); }}
          onDelete={async (id) => { await deleteTodo({ id: id as any }); }}
          onEdit={async (id, text) => { await updateTodo({ id: id as any, text }); }}
        />
      )}
    </SafeAreaView>
  );
}
