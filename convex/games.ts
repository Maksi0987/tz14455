import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateBlackjackDeck, calculateBlackjackScore, Card } from "./cards";

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

// Миттєвий старт одиночної гри проти бота
export const startSinglePlayerGame = mutation({
  args: { type: v.union(v.literal("blackjack"), v.literal("durak")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Необхідна авторизація");

    const deck = generateBlackjackDeck();
    const dealerHand = [deck.pop()!, deck.pop()!]; // Карти дилера (бота)
    
    const playersData: Record<string, any> = {
      [userId]: {
        hand: [deck.pop()!, deck.pop()!], // Карти гравця
        status: "playing", 
      }
    };

    return await ctx.db.insert("games", {
      type: args.type,
      status: "playing", // Гра починається миттєво
      creatorId: userId,
      players: [userId],
      currentTurn: userId, // Хід гравця
      gameState: { deck, dealerHand, playersData, turnIndex: 0 },
      createdAt: Date.now(),
    });
  },
});

// Взяти карту (Hit)
export const hit = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "playing" || game.currentTurn !== userId) throw new ConvexError("Не ваш хід");

    const state = game.gameState;
    const pData = state.playersData[userId as string];
    
    pData.hand.push(state.deck.pop());
    const score = calculateBlackjackScore(pData.hand);

    if (score > 21) {
      pData.status = "busted";
      await botTurnAndFinish(ctx, game._id, userId as string, state);
    } else {
      await ctx.db.patch(game._id, { gameState: state });
    }
  },
});

// Зупинитись (Stand) - Передача ходу боту
export const stand = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "playing" || game.currentTurn !== userId) throw new ConvexError("Не ваш хід");

    const state = game.gameState;
    state.playersData[userId as string].status = "stood";
    await botTurnAndFinish(ctx, game._id, userId as string, state);
  },
});

// Логіка бота (Дилера) та завершення гри
async function botTurnAndFinish(ctx: any, gameId: any, playerId: string, state: any) {
  const pData = state.playersData[playerId];
  let dScore = calculateBlackjackScore(state.dealerHand);
  const pScore = calculateBlackjackScore(pData.hand);

  // Бот добирає карти, тільки якщо гравець не перебрав (не busted)
  if (pData.status !== "busted") {
    while (dScore < 17 && state.deck.length > 0) {
      state.dealerHand.push(state.deck.pop());
      dScore = calculateBlackjackScore(state.dealerHand);
    }
  }

  // Визначення переможця
  if (pData.status === "busted") {
    pData.status = "lost";
  } else if (dScore > 21 || pScore > dScore) {
    pData.status = "won";
  } else if (pScore === dScore) {
    pData.status = "push"; // Нічия
  } else {
    pData.status = "lost";
  }

  await ctx.db.patch(gameId, { status: "finished", currentTurn: undefined, gameState: state });
}