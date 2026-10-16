import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { calculateBlackjackScore } from "@/convex/cards";
import PlayingCard from "@/components/PlayingCard";

export default function GameTableScreen() {
  const { id } = useLocalSearchParams();
  const gameId = id as Id<"games">;
  const router = useRouter();

  const game = useQuery(api.games.getGame, { gameId });
  const currentUser = useQuery(api.users.currentUser);
  
  const hit = useMutation(api.games.hit);
  const stand = useMutation(api.games.stand);

  // Анімація для фінального результату
  const resultScale = useRef(new Animated.Value(0.5)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (game?.status === "finished") {
      Animated.parallel([
        Animated.spring(resultScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.timing(resultOpacity, { toValue: 1, duration: 400, useNativeDriver: true })
      ]).start();
    }
  }, [game?.status]);

  if (game === undefined || currentUser === undefined) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#10B981" /></View>;
  }

  if (game === null) {
    return <View style={[styles.container, styles.center]}><Text style={{ color: "#fff" }}>Гру не знайдено</Text></View>;
  }

  const state = game.gameState;
  const myData = state?.playersData?.[currentUser._id];
  const isFinished = game.status === "finished";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Лобі</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BLACKJACK</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View style={styles.dealerArea}>
          <Text style={styles.dealerTitle}>ДИЛЕР</Text>
          <View style={styles.handContainer}>
            {state.dealerHand.map((card: any, idx: number) => (
              <PlayingCard key={`dealer-${idx}-${card.suit}${card.rank}`} card={card} index={idx} hidden={!isFinished && idx === 1} />
            ))}
          </View>
          {isFinished && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{calculateBlackjackScore(state.dealerHand)}</Text>
            </View>
          )}
        </View>

        {isFinished && (
          <Animated.View style={[
            styles.resultBox, 
            myData.status === 'won' ? styles.resultWon : myData.status === 'push' ? styles.resultPush : styles.resultLost,
            { transform: [{ scale: resultScale }], opacity: resultOpacity }
          ]}>
            <Text style={styles.resultText}>
              {myData.status === 'won' ? 'ВИ ВИГРАЛИ! 🎉' : myData.status === 'push' ? 'НІЧИЯ 🤝' : 'ВИ ПРОГРАЛИ 😢'}
            </Text>
            <TouchableOpacity style={styles.playAgainBtn} onPress={() => router.back()}>
              <Text style={styles.playAgainText}>Зіграти ще раз</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={[styles.myArea, isFinished && {opacity: 0.8}]}>
          <Text style={styles.myTitle}>ВАШІ КАРТИ</Text>
          <View style={styles.handContainer}>
            {myData?.hand.map((card: any, idx: number) => (
              <PlayingCard key={`player-${idx}-${card.suit}${card.rank}`} card={card} index={idx} />
            ))}
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{calculateBlackjackScore(myData?.hand || [])}</Text>
          </View>
        </View>
      </ScrollView>

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
  container: { flex: 1, backgroundColor: "#022C22" },
  center: { justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  headerTitle: { color: "#FCD34D", fontSize: 20, fontWeight: "900", letterSpacing: 2 },
  dealerArea: { alignItems: "center", marginBottom: 50, marginTop: 10 },
  dealerTitle: { color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: "bold", marginBottom: 16, letterSpacing: 3 },
  myArea: { alignItems: "center", padding: 24, backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 24 },
  myTitle: { color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: "bold", marginBottom: 16, letterSpacing: 3 },
  handContainer: { flexDirection: "row", justifyContent: "center", paddingLeft: 40, minHeight: 140 },
  scoreBadge: { backgroundColor: "#111827", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 24, marginTop: -15, zIndex: 10, borderWidth: 2, borderColor: "#F59E0B", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3, elevation: 5 },
  scoreText: { color: "#FCD34D", fontSize: 18, fontWeight: "900" },
  resultBox: { marginVertical: 10, padding: 24, borderRadius: 24, alignItems: "center", borderWidth: 2, marginHorizontal: 20, backgroundColor: "rgba(0,0,0,0.5)" },
  resultWon: { borderColor: "#10B981", shadowColor: "#10B981", shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  resultPush: { borderColor: "#F59E0B" },
  resultLost: { borderColor: "#F43F5E" },
  resultText: { fontSize: 28, fontWeight: "900", color: "#fff", marginBottom: 20, textAlign: "center" },
  playAgainBtn: { backgroundColor: "#fff", paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16 },
  playAgainText: { fontSize: 16, fontWeight: "bold", color: "#022C22", textTransform: "uppercase" },
  controls: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", padding: 20, gap: 16, backgroundColor: "#064E3B", paddingBottom: 40, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", shadowColor: "#000", shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  controlBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, elevation: 2 },
  controlBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold", textTransform: "uppercase" }
});