import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { calculateBlackjackScore } from "@/convex/cards";

export default function GameTableScreen() {
  const { id } = useLocalSearchParams();
  const gameId = id as Id<"games">;
  const router = useRouter();

  const game = useQuery(api.games.getGame, { gameId });
  const currentUser = useQuery(api.users.currentUser);
  
  const hit = useMutation(api.games.hit);
  const stand = useMutation(api.games.stand);

  if (game === undefined || currentUser === undefined) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (game === null) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "#fff" }}>Гру не знайдено</Text>
      </View>
    );
  }

  const state = game.gameState;
  const myData = state?.playersData?.[currentUser._id];
  const isFinished = game.status === "finished";

  const RenderCard = ({ card, hidden = false }: { card?: any; hidden?: boolean }) => {
    if (hidden) {
      return (
        <View style={[styles.card, styles.cardHidden]}>
          <View style={styles.cardBackPattern} />
        </View>
      );
    }
    const isRed = card.suit === "♥" || card.suit === "♦";
    return (
      <View style={styles.card}>
        <Text style={[styles.cardRank, { color: isRed ? "#F43F5E" : "#1E293B" }]}>{card.rank}</Text>
        <Ionicons name={card.suit === '♥' ? 'heart' : card.suit === '♦' ? 'diamond' : card.suit === '♣' ? 'medical' : 'leaf'} size={24} color={isRed ? "#F43F5E" : "#1E293B"} style={{alignSelf: 'center'}} />
        <Text style={[styles.cardSuit, { color: isRed ? "#F43F5E" : "#1E293B" }]}>{card.suit}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Стіл Блекджеку</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* Дилер (Бот) */}
        <View style={styles.dealerArea}>
          <Text style={styles.dealerTitle}>🤖 Дилер</Text>
          <View style={styles.handContainer}>
            {state.dealerHand.map((card: any, idx: number) => (
              <RenderCard key={idx} card={card} hidden={!isFinished && idx === 1} />
            ))}
          </View>
          {isFinished && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{calculateBlackjackScore(state.dealerHand)}</Text>
            </View>
          )}
        </View>

        {/* Результат гри (з'являється в кінці) */}
        {isFinished && (
          <View style={[styles.resultBox, myData.status === 'won' ? styles.resultWon : myData.status === 'push' ? styles.resultPush : styles.resultLost]}>
            <Text style={styles.resultText}>
              {myData.status === 'won' ? 'ВИ ВИГРАЛИ! 🎉' : myData.status === 'push' ? 'НІЧИЯ 🤝' : 'ВИ ПРОГРАЛИ 😢'}
            </Text>
            <TouchableOpacity style={styles.playAgainBtn} onPress={() => router.back()}>
              <Text style={styles.playAgainText}>Повернутись в меню</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Гравець */}
        <View style={[styles.myArea, isFinished && {opacity: 0.8}]}>
          <Text style={styles.myTitle}>Ваші карти</Text>
          <View style={styles.handContainer}>
            {myData?.hand.map((card: any, idx: number) => (
              <RenderCard key={idx} card={card} />
            ))}
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{calculateBlackjackScore(myData?.hand || [])}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Кнопки керування */}
      {!isFinished && (
        <View style={styles.controls}>
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#F59E0B" }]} onPress={() => hit({ gameId })}>
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.controlBtnText}>Взяти (Hit)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#3B82F6" }]} onPress={() => stand({ gameId })}>
            <Ionicons name="hand-right" size={24} color="#fff" />
            <Text style={styles.controlBtnText}>Досить (Stand)</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#064E3B" }, // Зелене сукно
  center: { justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  dealerArea: { alignItems: "center", marginBottom: 30, marginTop: 10 },
  dealerTitle: { color: "rgba(255,255,255,0.7)", fontSize: 18, fontWeight: "bold", marginBottom: 12, textTransform: "uppercase" },
  myArea: { alignItems: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  myTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  handContainer: { flexDirection: "row", gap: -20, marginBottom: 16, justifyContent: "center" }, // Карти йдуть нахлистом
  card: { width: 80, height: 115, backgroundColor: "#fff", borderRadius: 10, padding: 8, justifyContent: "space-between", shadowColor: "#000", shadowOffset: { width: -2, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 6, borderWidth: 1, borderColor: "#E2E8F0" },
  cardHidden: { backgroundColor: "#022C22", borderWidth: 2, borderColor: "#047857", padding: 4 },
  cardBackPattern: { flex: 1, borderWidth: 1, borderColor: "#064E3B", borderRadius: 4, borderStyle: "dashed" },
  cardRank: { fontSize: 20, fontWeight: "900" },
  cardSuit: { fontSize: 20, alignSelf: "flex-end" },
  scoreBadge: { backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  scoreText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  resultBox: { marginVertical: 20, padding: 20, borderRadius: 20, alignItems: "center", borderWidth: 2 },
  resultWon: { backgroundColor: "rgba(16,185,129,0.2)", borderColor: "#10B981" },
  resultPush: { backgroundColor: "rgba(245,158,11,0.2)", borderColor: "#F59E0B" },
  resultLost: { backgroundColor: "rgba(244,63,94,0.2)", borderColor: "#F43F5E" },
  resultText: { fontSize: 28, fontWeight: "900", color: "#fff", marginBottom: 16 },
  playAgainBtn: { backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  playAgainText: { fontSize: 16, fontWeight: "bold", color: "#064E3B" },
  controls: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", padding: 20, gap: 16, backgroundColor: "rgba(0,0,0,0.8)", paddingBottom: 40 },
  controlBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  controlBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});