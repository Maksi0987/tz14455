import React, { useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export default function TodoForm({ onAdd }: { onAdd: (text: string) => Promise<void> }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handle = async () => {
    const t = text.trim();
    if (!t || loading) return;
    try {
      setLoading(true);
      Keyboard.dismiss();
      await onAdd(t);
      setText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.box}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="Що потрібно зробити?"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handle}
        returnKeyType="done"
      />
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }, (!text.trim() || loading) && { opacity: 0.5 }]}
        onPress={handle}
        disabled={!text.trim() || loading}
      >
        <Text style={styles.btnText}>{loading ? "..." : "Додати"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  input: { flex: 1, height: 48, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, fontSize: 15 },
  btn: { paddingHorizontal: 18, justifyContent: "center", alignItems: "center", borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "600" },
});
