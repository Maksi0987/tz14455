export interface Card {
  suit: string;
  rank: string;
  value: number;
}

export function generateBlackjackDeck(): Card[] {
  const suits = ["♥", "♦", "♣", "♠"];
  const ranks = [
    { rank: "2", value: 2 }, { rank: "3", value: 3 }, { rank: "4", value: 4 }, { rank: "5", value: 5 },
    { rank: "6", value: 6 }, { rank: "7", value: 7 }, { rank: "8", value: 8 }, { rank: "9", value: 9 },
    { rank: "10", value: 10 }, { rank: "J", value: 10 }, { rank: "Q", value: 10 }, { rank: "K", value: 10 },
    { rank: "A", value: 11 }
  ];
  let deck: Card[] = [];
  for (let suit of suits) {
    for (let r of ranks) { deck.push({ suit, rank: r.rank, value: r.value }); }
  }
  return deck.sort(() => Math.random() - 0.5);
}

export function calculateBlackjackScore(hand: Card[]): number {
  let score = 0; let aces = 0;
  for (let card of hand) {
    score += card.value;
    if (card.rank === "A") aces += 1;
  }
  while (score > 21 && aces > 0) { score -= 10; aces -= 1; }
  return score;
}

// Нова функція для Дурня (36 карт)
export function generateDurakDeck(): Card[] {
  const suits = ["♥", "♦", "♣", "♠"];
  // Значення важливе для порівняння: 6 найменша, Туз найбільший
  const ranks = [
    { rank: "6", value: 6 }, { rank: "7", value: 7 }, { rank: "8", value: 8 }, { rank: "9", value: 9 },
    { rank: "10", value: 10 }, { rank: "J", value: 11 }, { rank: "Q", value: 12 }, { rank: "K", value: 13 },
    { rank: "A", value: 14 }
  ];
  let deck: Card[] = [];
  for (let suit of suits) {
    for (let r of ranks) { deck.push({ suit, rank: r.rank, value: r.value }); }
  }
  return deck.sort(() => Math.random() - 0.5);
}