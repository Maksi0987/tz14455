// convex/cards.ts

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A" | "2" | "3" | "4" | "5";

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // Значення для Блекджека або сила карти для Дурня
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

// Генерація перемішаної колоди для Блекджека (52 карти)
export function generateBlackjackDeck(): Card[] {
  const deck: Card[] = [];
  const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  
  for (const suit of SUITS) {
    for (const rank of ranks) {
      let value = parseInt(rank);
      if (["J", "Q", "K"].includes(rank)) value = 10;
      if (rank === "A") value = 11; // Туз за замовчуванням 11
      
      deck.push({ suit, rank, value });
    }
  }
  return shuffle(deck);
}

// Підрахунок очок (Туз стає 1, якщо сума > 21)
export function calculateBlackjackScore(hand: Card[]): number {
  let score = 0;
  let aces = 0;
  
  for (const card of hand) {
    score += card.value;
    if (card.rank === "A") aces += 1;
  }
  
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  
  return score;
}

// Генерація колоди для Дурня (36 карт) - на майбутнє
export function generateDurakDeck(): Card[] {
  const deck: Card[] = [];
  const ranks: Rank[] = ["6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  
  for (const suit of SUITS) {
    for (let i = 0; i < ranks.length; i++) {
      deck.push({ suit, rank: ranks[i], value: i + 6 }); // Сила карти по зростанню
    }
  }
  return shuffle(deck);
}

// Алгоритм тасування Фішера-Єйтса
function shuffle(array: Card[]): Card[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}