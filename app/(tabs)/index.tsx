import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MenuScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const startSinglePlayerGame = useMutation(api.games.startSinglePlayerGame);

  const handlePlay = async (type: "blackjack" | "durak") => {
    if (type === "durak") {
      alert("Дурень проти бота ще в розробці!");
      return;
    }
    
    setLoadingType(type);
    try {
      const gameId = await startSinglePlayerGame({ type });
      router.push(`/game/${gameId}`);
    } catch (error: any) {
      alert(`Справжня помилка: ${error.message || error}`);
      console.error(error);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Одиночна гра</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Грайте проти комп'ютера</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Картка Блекджеку */}
        <TouchableOpacity 
          style={[styles.gameCard, { backgroundColor: "#10B981" }]} // Зелений
          onPress={() => handlePlay("blackjack")}
          disabled={loadingType !== null}
        >
          <Ionicons name="card" size={48} color="#fff" style={{ marginBottom: 12 }} />
          <Text style={styles.gameTitle}>Блекджек (21)</Text>
          <Text style={styles.gameDesc}>Грати проти Дилера</Text>
          {loadingType === "blackjack" && <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />}
        </TouchableOpacity>

        {/* Картка Дурня */}
        <TouchableOpacity 
          style={[styles.gameCard, { backgroundColor: "#8B5CF6", opacity: 0.8 }]} // Фіолетовий
          onPress={() => handlePlay("durak")}
          disabled={loadingType !== null}
        >
          <Ionicons name="color-wand" size={48} color="#fff" style={{ marginBottom: 12 }} />
          <Text style={styles.gameTitle}>Дурень</Text>
          <Text style={styles.gameDesc}>Грати проти Бота (Скоро)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 30, alignItems: "center", marginTop: 20 },
  title: { fontSize: 32, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 16 },
  cardsContainer: { gap: 20 },
  gameCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  gameTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  gameDesc: { fontSize: 15, color: "rgba(255,255,255,0.8)" },
});