import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import PlayingCard from "@/components/PlayingCard";

const CasinoChip = ({ color, top, left, right, bottom }: any) => (
  <View style={[styles.chipOuter, { borderColor: color, top, left, right, bottom }]}><View style={[styles.chipInner, { backgroundColor: color }]} /></View>
);

// ПОКРАЩЕНЕ СОРТУВАННЯ КАРТ
const sortCards = (cards: any[], trumpSuit: string) => {
  if (!cards) return [];
  
  const getSuitPriority = (suit: string) => {
    if (suit === trumpSuit) return 0; // Козир ЗАВЖДИ має найвищий пріоритет (перший зліва)
    if (suit === "♥") return 1; // Потім чирва
    if (suit === "♦") return 2; // Буба
    if (suit === "♣") return 3; // Хреста
    return 4; // Піка
  };

  return [...cards].sort((a, b) => {
    const priorityA = getSuitPriority(a.suit);
    const priorityB = getSuitPriority(b.suit);
    
    // Спочатку сортуємо за пріоритетом масті
    if (priorityA !== priorityB) return priorityA - priorityB;
    // Якщо масть однакова, сортуємо за номіналом (від меншої до більшої)
    return a.value - b.value;
  });
};

export default function DurakTableScreen() {
  const { id } = useLocalSearchParams();
  const gameId = id as Id<"games">;
  const router = useRouter();

  const game = useQuery(api.games.getGame, { gameId });
  const currentUser = useQuery(api.users.currentUser);
  
  const playCard = useMutation(api.games.playDurakCard);
  const finishTurn = useMutation(api.games.finishDurakTurn);
  const transferCard = useMutation(api.games.transferDurakCard);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Анімація для фінального результату
  const resultScale = useRef(new Animated.Value(0.5)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (game?.status === "finished") {
      Animated.parallel([
        Animated.spring(resultScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.timing(resultOpacity, { toValue: 1, duration: 400, useNativeDriver: true })
      ]).start();
    }
  }, [game?.status]);

  if (game === undefined || currentUser === undefined) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#10B981" /></View>;
  if (game === null) return <View style={[styles.container, styles.center]}><Text style={{ color: "#fff" }}>Гру не знайдено</Text></View>;

  const state = game.gameState;
  const myData = state?.playersData?.[currentUser._id];
  const botData = state?.playersData?.["bot"];
  const isFinished = game.status === "finished";
  const isMyTurn = state.attacker === currentUser._id;
  const allCardsBeaten = state.tableCards.every((pair: any) => pair.defend !== null);

  const sortedMyHand = sortCards(myData?.hand || [], state.trumpCard?.suit);

  const getOriginalIndex = (cardId: string) => myData.hand.findIndex((c: any) => `${c.suit}${c.rank}` === cardId);

  const handlePlayCard = async () => {
    if (!selectedCardId) return;
    const originalIndex = getOriginalIndex(selectedCardId);
    if (originalIndex === -1) return;
    try {
      await playCard({ gameId, cardIndex: originalIndex });
      setSelectedCardId(null);
    } catch (err: any) { alert(err.message || err); }
  };

  const handleTransfer = async () => {
    if (!selectedCardId) return;
    const originalIndex = getOriginalIndex(selectedCardId);
    if (originalIndex === -1) return;
    try {
      await transferCard({ gameId, cardIndex: originalIndex });
      setSelectedCardId(null);
    } catch (err: any) { alert(err.message || err); }
  };

  const handleFinishTurn = async () => {
    try {
      await finishTurn({ gameId });
      setSelectedCardId(null);
    } catch (err: any) { alert(err.message || err); }
  };

  // Визначення переможця
  let resultMessage = "";
  let resultStyle = styles.resultLost;
  if (isFinished) {
    if (myData?.hand?.length === 0 && botData?.hand?.length === 0) {
      resultMessage = "НІЧИЯ 🤝";
      resultStyle = styles.resultPush;
    } else if (myData?.hand?.length === 0) {
      resultMessage = "ВИ ВИГРАЛИ! 🎉";
      resultStyle = styles.resultWon;
    } else {
      resultMessage = "ВИ ПРОГРАЛИ 😢 (Дурень)";
      resultStyle = styles.resultLost;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /><Text style={styles.backText}>Лобі</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>ДУРЕНЬ (Перевідний)</Text>
        <View style={{ width: 70 }} />
      </View>

      <Animated.View style={[styles.tableArea, { opacity: fadeAnim }]}>
        <CasinoChip color="#EF4444" top={20} left={20} />
        <CasinoChip color="#3B82F6" top={50} left={35} />
        <CasinoChip color="#F59E0B" bottom={60} right={25} />
        <CasinoChip color="#10B981" bottom={90} right={45} />

        {/* Блок з результатом */}
        {isFinished && (
          <Animated.View style={[
            styles.resultBox, 
            resultStyle,
            { transform: [{ scale: resultScale }], opacity: resultOpacity, zIndex: 100 }
          ]}>
            <Text style={styles.resultText}>{resultMessage}</Text>
            <TouchableOpacity style={styles.playAgainBtn} onPress={() => router.back()}>
              <Text style={styles.playAgainText}>Повернутися в Лобі</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Якщо гра не завершена, показуємо Антона і поле */}
        {!isFinished && (
          <>
            <View style={styles.botArea}>
              <View style={[styles.playerInfoBadge, !isMyTurn && { borderColor: "#F59E0B", borderWidth: 2 }]}>
                <Ionicons name="person-circle" size={20} color="#E2E8F0" />
                <Text style={styles.botTitle}>Антон ({botData?.hand?.length || 0})</Text>
              </View>
              <View style={styles.handContainer}>
                {botData?.hand?.map((_: any, idx: number) => <PlayingCard key={`bot-${idx}`} hidden={true} index={idx} />)}
              </View>
            </View>

            <View style={styles.centerArea}>
              <View style={styles.deckArea}>
                {state.deck?.length > 0 ? (
                  <>
                    <View style={styles.trumpWrapper}><PlayingCard card={state.trumpCard} index={0} /></View>
                    <View style={styles.deckWrapper}><PlayingCard hidden={true} index={0} />
                      <View style={styles.deckCountBadge}><Text style={styles.deckCountText}>{state.deck.length}</Text></View>
                    </View>
                  </>
                ) : <View style={styles.trumpIconWrapper}><Text style={styles.trumpIconSuit}>{state.trumpCard?.suit}</Text></View>}
              </View>
              
              <View style={[styles.battleArea, state.tableCards?.length > 0 && { backgroundColor: "transparent", borderWidth: 0 }]}>
                {state.tableCards?.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{alignItems: 'center', paddingHorizontal: 20}}>
                    {state.tableCards.map((pair: any, idx: number) => (
                      <View key={idx} style={{ position: 'relative', marginRight: 15 }}>
                        <PlayingCard card={pair.attack} index={0} />
                        {pair.defend && (
                          <View style={{ position: 'absolute', top: 15, left: 15, zIndex: 5, elevation: 5 }}>
                            <PlayingCard card={pair.defend} index={0} />
                          </View>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                ) : <Text style={{color: "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: "600"}}>Стіл порожній</Text>}
                {state.botTaking && <View style={styles.botTakingBadge}><Text style={styles.botTakingText}>Антон бере 😢</Text></View>}
              </View>
            </View>
          </>
        )}

        <View style={styles.myArea}>
          <View style={[styles.playerInfoBadge, isMyTurn && !isFinished && { borderColor: "#10B981", borderWidth: 2 }]}>
            <Ionicons name="person" size={18} color="#E2E8F0" />
            <Text style={styles.myTitle}>Ваші карти</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.myHandScroll}>
            {sortedMyHand.map((card: any, idx: number) => {
              const cardId = `${card.suit}${card.rank}`;
              const isSelected = selectedCardId === cardId;
              
              return (
                <TouchableOpacity 
                  key={`player-${idx}-${cardId}`} 
                  activeOpacity={0.8} 
                  onPress={() => !isFinished && setSelectedCardId(isSelected ? null : cardId)} 
                  style={{ transform: [{ translateY: isSelected ? -20 : 0 }], zIndex: isSelected ? 10 : 1 }}
                >
                  <PlayingCard card={card} index={idx} />
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </Animated.View>

      {!isFinished && (
        <View style={styles.controls}>
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: isMyTurn ? "#10B981" : "#EF4444", opacity: selectedCardId !== null ? 1 : 0.5 }]} onPress={handlePlayCard}>
            <Ionicons name={isMyTurn ? "play" : "shield"} size={20} color="#fff" />
            <Text style={styles.controlBtnText}>{isMyTurn ? "Сходити" : "Відбити"}</Text>
          </TouchableOpacity>
          
          {!isMyTurn && state.tableCards.length > 0 && state.isTransferAllowed && (
            <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#8B5CF6", opacity: selectedCardId !== null ? 1 : 0.5 }]} onPress={handleTransfer}>
              <Ionicons name="swap-horizontal" size={20} color="#fff" />
              <Text style={styles.controlBtnText}>Перевести</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.controlBtn, { backgroundColor: "#3B82F6", opacity: state.tableCards?.length > 0 ? 1 : 0.5 }]} 
            onPress={handleFinishTurn}
          >
            <Ionicons name={isMyTurn ? "checkmark-done" : "hand-right"} size={20} color="#fff" />
            <Text style={styles.controlBtnText}>
              {isMyTurn ? (state.botTaking ? "Віддати Антону" : "Бито") : (allCardsBeaten ? "Бито" : "Забрати карти")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#064E3B" },
  center: { justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  headerTitle: { color: "#FCD34D", fontSize: 20, fontWeight: "900", letterSpacing: 2 },
  tableArea: { flex: 1, paddingVertical: 10, justifyContent: "space-between", position: "relative" },
  chipOuter: { position: "absolute", width: 44, height: 44, borderRadius: 22, borderWidth: 4, borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "#fff", opacity: 0.8 },
  chipInner: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "#fff" },
  playerInfoBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  botArea: { alignItems: "center", marginTop: 10, zIndex: 1 },
  botTitle: { color: "#E2E8F0", fontSize: 15, fontWeight: "bold", letterSpacing: 1 },
  handContainer: { flexDirection: "row", justifyContent: "center", paddingLeft: 40, height: 140 },
  centerArea: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, zIndex: 1 },
  deckArea: { position: "relative", justifyContent: "center", width: 120, height: 140, zIndex: 10 },
  trumpWrapper: { position: "absolute", left: 30, transform: [{ rotate: "90deg" }] },
  deckWrapper: { position: "absolute", left: 0 },
  deckCountBadge: { position: "absolute", top: -10, right: -10, backgroundColor: "#EF4444", borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#fff" },
  deckCountText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  trumpIconWrapper: { flex: 1, justifyContent: "center", alignItems: "center", opacity: 0.3 },
  trumpIconSuit: { fontSize: 64 },
  battleArea: { flex: 1, height: 180, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)", borderStyle: "dashed", borderRadius: 20, justifyContent: "center", marginLeft: 10, backgroundColor: "rgba(0,0,0,0.1)", position: "relative" },
  botTakingBadge: { position: "absolute", bottom: -15, alignSelf: "center", backgroundColor: "#EF4444", paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12, elevation: 5 },
  botTakingText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  myArea: { alignItems: "center", paddingVertical: 10, zIndex: 1 },
  myTitle: { color: "#E2E8F0", fontSize: 15, fontWeight: "bold", letterSpacing: 1 },
  myHandScroll: { paddingLeft: 40, paddingRight: 40, paddingBottom: 10, paddingTop: 30 },
  controls: { flexDirection: "row", padding: 20, gap: 10, backgroundColor: "rgba(0,0,0,0.6)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  controlBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 5 },
  controlBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold", textTransform: "uppercase" },
  
  // Стилі для результату
  resultBox: { position: "absolute", top: "30%", alignSelf: "center", padding: 24, borderRadius: 24, alignItems: "center", borderWidth: 2, backgroundColor: "rgba(0,0,0,0.85)", width: "80%" },
  resultWon: { borderColor: "#10B981", shadowColor: "#10B981", shadowOpacity: 0.6, shadowRadius: 15, elevation: 10 },
  resultPush: { borderColor: "#F59E0B" },
  resultLost: { borderColor: "#F43F5E", shadowColor: "#F43F5E", shadowOpacity: 0.6, shadowRadius: 15, elevation: 10 },
  resultText: { fontSize: 28, fontWeight: "900", color: "#fff", marginBottom: 20, textAlign: "center" },
  playAgainBtn: { backgroundColor: "#fff", paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16 },
  playAgainText: { fontSize: 16, fontWeight: "bold", color: "#064E3B", textTransform: "uppercase" }
});