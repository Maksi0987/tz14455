import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function PlayingCard({ card, hidden = false, index = 0 }: { card?: any, hidden?: boolean, index?: number }) {
  // Початкові значення анімацій: карта лежить десь високо і справа (ніби в колоді дилера)
  const translateY = useRef(new Animated.Value(-400)).current;
  const translateX = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.2)).current;
  const rotate = useRef(new Animated.Value(1)).current; // 1 = карта повернута на 75 градусів

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 150), // Затримка для кожної наступної карти
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.spring(translateX, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
        Animated.spring(rotate, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true })
      ])
    ]).start();
  }, [card]); // Перезапуск анімації, якщо об'єкт карти зміниться

  // Інтерполяція для обертання карти в польоті
  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '75deg']
  });

  const overlapStyle = { marginLeft: index === 0 ? 0 : -50 };
  const animStyle = { opacity, transform: [{ translateY }, { translateX }, { scale }, { rotate: rotation }] };

  if (hidden) {
    return (
      <Animated.View style={[styles.card, styles.hiddenCard, overlapStyle, animStyle]}>
        <View style={styles.cardBackPattern}>
          <Text style={styles.cardBackLogo}>⚜️</Text>
        </View>
      </Animated.View>
    );
  }

  const isRed = card.suit === "♥" || card.suit === "♦";
  const color = isRed ? "#E11D48" : "#0F172A";

  return (
    <Animated.View style={[styles.card, overlapStyle, animStyle]}>
      <View style={styles.topLeft}>
        <Text style={[styles.cornerRank, { color }]}>{card.rank}</Text>
        <Text style={[styles.cornerSuit, { color }]}>{card.suit}</Text>
      </View>
      <View style={styles.center}>
        <Text style={[styles.centerSuit, { color }]}>{card.suit}</Text>
      </View>
      <View style={styles.bottomRight}>
        <Text style={[styles.cornerRank, { color }]}>{card.rank}</Text>
        <Text style={[styles.cornerSuit, { color }]}>{card.suit}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { width: 90, height: 135, backgroundColor: "#fff", borderRadius: 10, padding: 6, justifyContent: "space-between", shadowColor: "#000", shadowOffset: { width: -4, height: 6 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  hiddenCard: { backgroundColor: "#831843", borderWidth: 2, borderColor: "#FBBF24", padding: 6 },
  cardBackPattern: { flex: 1, borderWidth: 1, borderColor: "rgba(251, 191, 36, 0.5)", borderRadius: 6, borderStyle: "solid", justifyContent: "center", alignItems: "center" },
  cardBackLogo: { fontSize: 36, opacity: 0.8 },
  topLeft: { alignItems: "center", alignSelf: "flex-start", zIndex: 2 },
  bottomRight: { alignItems: "center", alignSelf: "flex-end", transform: [{ rotate: "180deg" }], zIndex: 2 },
  center: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "center", alignItems: "center", zIndex: 1 },
  cornerRank: { fontSize: 20, fontWeight: "900", lineHeight: 22 },
  cornerSuit: { fontSize: 18, lineHeight: 18 },
  centerSuit: { fontSize: 54, opacity: 0.15 }
});