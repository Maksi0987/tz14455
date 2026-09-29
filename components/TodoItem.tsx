import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import type { Todo } from "@/types";

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, text: string) => Promise<void>;
}) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  const save = async () => {
    const t = text.trim();
    if (!t) { setText(todo.text); setEditing(false); return; }
    if (t !== todo.text) await onEdit(todo._id, t);
    setEditing(false);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.checkbox, { borderColor: todo.isCompleted ? colors.success : colors.border }, todo.isCompleted && { backgroundColor: colors.success }]}
        onPress={() => onToggle(todo._id)}
      >
        {todo.isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
      </TouchableOpacity>

      {editing ? (
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.primary, backgroundColor: colors.bg }]}
          value={text}
          onChangeText={setText}
          onBlur={save}
          onSubmitEditing={save}
          autoFocus
        />
      ) : (
        <Text style={[styles.text, { color: colors.text }, todo.isCompleted && { textDecorationLine: "line-through", color: colors.textMuted }]} onPress={() => !todo.isCompleted && setEditing(true)}>
          {todo.text}
        </Text>
      )}

      <View style={styles.actions}>
        {!editing && !todo.isCompleted && (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Ionicons name="pencil-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onDelete(todo._id)}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8, gap: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, fontSize: 15 },
  input: { flex: 1, fontSize: 15, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1.5, borderRadius: 6 },
  actions: { flexDirection: "row", gap: 6 },
});
