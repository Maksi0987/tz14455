import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateBlackjackDeck, calculateBlackjackScore, generateDurakDeck } from "./cards";

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => await ctx.db.get(args.gameId),
});

export const startSinglePlayerGame = mutation({
  args: { type: v.union(v.literal("blackjack"), v.literal("durak")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Необхідна авторизація");

    if (args.type === "blackjack") {
      const deck = generateBlackjackDeck();
      const dealerHand = [deck.pop()!, deck.pop()!];
      return await ctx.db.insert("games", {
        type: "blackjack", status: "playing", creatorId: userId, players: [userId], currentTurn: userId,
        gameState: { deck, dealerHand, playersData: { [userId]: { hand: [deck.pop()!, deck.pop()!], status: "playing" } }, turnIndex: 0 }, createdAt: Date.now(),
      });
    } else {
      const deck = generateDurakDeck();
      const trumpCard = deck[0]; 
      const playerHand = []; const botHand = [];
      for(let i = 0; i < 6; i++) { playerHand.push(deck.pop()!); botHand.push(deck.pop()!); }

      return await ctx.db.insert("games", {
        type: "durak", status: "playing", creatorId: userId, players: [userId], currentTurn: userId,
        gameState: { deck, trumpCard, tableCards: [], playersData: { [userId]: { hand: playerHand }, "bot": { hand: botHand } }, attacker: userId, defender: "bot", botTaking: false, isTransferAllowed: true }, 
        createdAt: Date.now(),
      });
    }
  },
});

// === НОВА УНІВЕРСАЛЬНА ФУНКЦІЯ ОНОВЛЕННЯ СТАТИСТИКИ ===
async function updateGameStats(ctx: any, playerId: string, finalStatus: string) {
  let stats = await ctx.db.query("playerStats").withIndex("by_user", (q: any) => q.eq("userId", playerId)).first();
  let wins = stats?.wins || 0; let losses = stats?.losses || 0; let draws = stats?.draws || 0; let xp = stats?.xp || 0;
  
  if (finalStatus === "won") { wins += 1; xp += 30; } // Дурень дає більше досвіду!
  else if (finalStatus === "lost") { losses += 1; xp += 5; } 
  else { draws += 1; xp += 15; }
  
  const level = Math.floor(Math.sqrt(xp / 10)) + 1; 
  let rank = "Новачок";
  if (xp > 100) rank = "Любитель"; if (xp > 300) rank = "Досвідчений"; if (xp > 700) rank = "Профі"; if (xp > 1500) rank = "Майстер"; if (xp > 5000) rank = "Легенда";
  
  if (stats) { await ctx.db.patch(stats._id, { wins, losses, draws, xp, level, rank }); } 
  else { await ctx.db.insert("playerStats", { userId: playerId, wins, losses, draws, xp, level, rank }); }
}

export const hit = mutation({ args: { gameId: v.id("games") }, handler: async (ctx, args) => { 
  const userId = await getAuthUserId(ctx); const game = await ctx.db.get(args.gameId);
  if (!game || game.status !== "playing" || game.currentTurn !== userId) throw new ConvexError("Не ваш хід");
  const state = game.gameState; const pData = state.playersData[userId as string]; pData.hand.push(state.deck.pop());
  if (calculateBlackjackScore(pData.hand) > 21) { pData.status = "busted"; await botTurnAndFinish(ctx, game._id, userId as string, state); } 
  else { await ctx.db.patch(game._id, { gameState: state }); }
}});

export const stand = mutation({ args: { gameId: v.id("games") }, handler: async (ctx, args) => {
  const userId = await getAuthUserId(ctx); const game = await ctx.db.get(args.gameId);
  if (!game || game.status !== "playing" || game.currentTurn !== userId) throw new ConvexError("Не ваш хід");
  const state = game.gameState; state.playersData[userId as string].status = "stood";
  await botTurnAndFinish(ctx, game._id, userId as string, state);
}});

async function botTurnAndFinish(ctx: any, gameId: any, playerId: string, state: any) {
  const pData = state.playersData[playerId];
  let dScore = calculateBlackjackScore(state.dealerHand);
  const pScore = calculateBlackjackScore(pData.hand);
  if (pData.status !== "busted") { while (dScore < 17 && state.deck.length > 0) { state.dealerHand.push(state.deck.pop()); dScore = calculateBlackjackScore(state.dealerHand); } }
  let finalStatus = "lost";
  if (pData.status === "busted") finalStatus = "lost"; else if (dScore > 21 || pScore > dScore) finalStatus = "won"; else if (pScore === dScore) finalStatus = "push";
  pData.status = finalStatus;
  
  await updateGameStats(ctx, playerId, finalStatus);
  await ctx.db.patch(gameId, { status: "finished", currentTurn: undefined, gameState: state });
}

function botAttackFirstCard(botData: any, state: any) {
  if (botData.hand.length === 0) return;
  let bestIdx = 0; let bestValue = 999;
  for(let i=0; i<botData.hand.length; i++) {
    let val = botData.hand[i].value + (botData.hand[i].suit === state.trumpCard.suit ? 100 : 0);
    if(val < bestValue) { bestValue = val; bestIdx = i; }
  }
  let card = botData.hand.splice(bestIdx, 1)[0];
  state.tableCards.push({ attack: card, defend: null });
}

// === ПЕРЕВІРКА ЗАВЕРШЕННЯ ДУРНЯ ТА ОНОВЛЕННЯ СТАТИСТИКИ ===
async function checkDurakFinish(ctx: any, gameId: any, userId: string, state: any, game: any) {
  const myData = state.playersData[userId];
  const botData = state.playersData["bot"];
  if (state.deck.length === 0 && (myData.hand.length === 0 || botData.hand.length === 0)) {
    game.status = "finished";
    let finalStatus = "lost";
    if (myData.hand.length === 0 && botData.hand.length === 0) finalStatus = "push";
    else if (myData.hand.length === 0) finalStatus = "won";
    
    await updateGameStats(ctx, userId, finalStatus);
  }
}

export const transferDurakCard = mutation({
  args: { gameId: v.id("games"), cardIndex: v.number() },
  handler: async (ctx, args) => {
    const userId = (await getAuthUserId(ctx)) as string;
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "playing") throw new ConvexError("Гра завершена");

    const state = game.gameState;
    const myData = state.playersData[userId];
    const botData = state.playersData["bot"];
    const playedCard = myData.hand[args.cardIndex];
    const trumpSuit = state.trumpCard.suit;

    if (state.attacker === userId) throw new ConvexError("Ви вже атакуєте!");
    if (!state.isTransferAllowed) throw new ConvexError("Переводити вже не можна!");
    if (state.tableCards.length + 1 > botData.hand.length) throw new ConvexError("У Антона не вистачить карт для відбою!");

    for (const pair of state.tableCards) {
      if (pair.defend) throw new ConvexError("Карти вже почали відбивати, переводити не можна!");
      if (pair.attack.rank !== playedCard.rank) throw new ConvexError("Можна перевести тільки картою такого ж номіналу!");
    }

    myData.hand.splice(args.cardIndex, 1);
    state.tableCards.push({ attack: playedCard, defend: null });
    
    state.attacker = userId;
    state.defender = "bot";
    state.botTaking = false;

    for (let pair of state.tableCards) {
      if (pair.defend === null) {
        let bestDefendIdx = -1; let bestValue = 999;
        for (let i = 0; i < botData.hand.length; i++) {
          const c = botData.hand[i];
          let canDefend = false;
          if (c.suit === pair.attack.suit && c.value > pair.attack.value) canDefend = true;
          else if (c.suit === trumpSuit && pair.attack.suit !== trumpSuit) canDefend = true;

          if (canDefend) {
            let val = c.value + (c.suit === trumpSuit ? 100 : 0);
            if (val < bestValue) { bestValue = val; bestDefendIdx = i; }
          }
        }
        if (bestDefendIdx !== -1) {
          pair.defend = botData.hand.splice(bestDefendIdx, 1)[0];
        } else {
          state.botTaking = true;
          break;
        }
      }
    }
    
    await checkDurakFinish(ctx, game._id, userId, state, game);
    await ctx.db.patch(game._id, { status: game.status, gameState: state });
  }
});

export const playDurakCard = mutation({
  args: { gameId: v.id("games"), cardIndex: v.number() },
  handler: async (ctx, args) => {
    const userId = (await getAuthUserId(ctx)) as string;
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "playing") throw new ConvexError("Гра завершена");

    const state = game.gameState;
    const myData = state.playersData[userId];
    const botData = state.playersData["bot"];
    const playedCard = myData.hand[args.cardIndex];
    const trumpSuit = state.trumpCard.suit;

    if (state.attacker === userId) {
      if (state.tableCards.length > 0 && !state.botTaking) {
        const lastPair = state.tableCards[state.tableCards.length - 1];
        if (!lastPair.defend) throw new ConvexError("Почекай! Антон ще не відбив попередню карту!");
      }

      const attackCardsCount = state.tableCards.length;
      const botOriginalHandSize = botData.hand.length + state.tableCards.filter((p: any) => p.defend !== null).length;
      if (attackCardsCount >= 6) throw new ConvexError("Ліміт: максимум 6 карт!");
      if (attackCardsCount >= botOriginalHandSize) throw new ConvexError("У Антона більше немає карт!");

      if (state.tableCards.length > 0) {
        const allowed = new Set();
        for (const pair of state.tableCards) {
          allowed.add(pair.attack.rank);
          if (pair.defend) allowed.add(pair.defend.rank);
        }
        if (!allowed.has(playedCard.rank)) throw new ConvexError("Тільки карти такого ж номіналу!");
      }

      myData.hand.splice(args.cardIndex, 1);
      state.tableCards.push({ attack: playedCard, defend: null });

      if (state.botTaking) {
         await checkDurakFinish(ctx, game._id, userId, state, game);
         await ctx.db.patch(game._id, { status: game.status, gameState: state });
         return;
      }

      let bestDefendIdx = -1; let bestValue = 999; 
      for (let i = 0; i < botData.hand.length; i++) {
        const c = botData.hand[i];
        let canDefend = false;
        if (c.suit === playedCard.suit && c.value > playedCard.value) canDefend = true;
        else if (c.suit === trumpSuit && playedCard.suit !== trumpSuit) canDefend = true;

        if (canDefend) {
          let val = c.value + (c.suit === trumpSuit ? 100 : 0); 
          if (val < bestValue) { bestValue = val; bestDefendIdx = i; }
        }
      }

      if (bestDefendIdx !== -1) {
        state.tableCards[state.tableCards.length - 1].defend = botData.hand.splice(bestDefendIdx, 1)[0];
        state.botTaking = false;
      } else {
        state.botTaking = true;
      }

    } else {
      state.isTransferAllowed = false; 
      const lastPair = state.tableCards[state.tableCards.length - 1];
      if (lastPair.defend) throw new ConvexError("Карта вже відбита! Чекай хід Антона або тисни Бито.");
      
      let canDefend = false;
      if (playedCard.suit === lastPair.attack.suit && playedCard.value > lastPair.attack.value) canDefend = true;
      else if (playedCard.suit === trumpSuit && lastPair.attack.suit !== trumpSuit) canDefend = true;

      if (!canDefend) throw new ConvexError("Ця карта не б'є!");

      myData.hand.splice(args.cardIndex, 1);
      lastPair.defend = playedCard;

      const allowed = new Set();
      for (const pair of state.tableCards) {
        allowed.add(pair.attack.rank);
        allowed.add(pair.defend.rank);
      }
      
      const attackCardsCount = state.tableCards.length;
      const myOriginalHandSize = myData.hand.length + state.tableCards.filter((p: any) => p.defend !== null).length;
      
      if (attackCardsCount < 6 && attackCardsCount < myOriginalHandSize) {
        let bestAttackIdx = -1; let bestValue = 999;
        for (let i=0; i<botData.hand.length; i++) {
          let c = botData.hand[i];
          if (allowed.has(c.rank)) {
            let val = c.value + (c.suit === trumpSuit ? 100 : 0);
            if (val < bestValue) { bestValue = val; bestAttackIdx = i; }
          }
        }
        
        if (bestAttackIdx !== -1) {
          let attackCard = botData.hand.splice(bestAttackIdx, 1)[0];
          state.tableCards.push({ attack: attackCard, defend: null });
        }
      }
    }

    await checkDurakFinish(ctx, game._id, userId, state, game);
    await ctx.db.patch(game._id, { status: game.status, gameState: state });
  }
});

export const finishDurakTurn = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const userId = (await getAuthUserId(ctx)) as string;
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "playing") throw new ConvexError("Гра завершена");

    const state = game.gameState;
    const myData = state.playersData[userId];
    const botData = state.playersData["bot"];

    if (state.tableCards.length === 0) throw new ConvexError("Стіл порожній!");

    const previousAttacker = state.attacker;
    let nextAttacker = "";

    if (previousAttacker === userId) {
      if (state.botTaking) {
        for (const pair of state.tableCards) { botData.hand.push(pair.attack); if (pair.defend) botData.hand.push(pair.defend); }
        nextAttacker = userId; 
      } else { 
        nextAttacker = "bot"; 
      }
    } else {
      const allBeaten = state.tableCards.every((p: any) => p.defend !== null);
      if (allBeaten) {
        nextAttacker = userId; 
      } else {
        for (const pair of state.tableCards) { myData.hand.push(pair.attack); if (pair.defend) myData.hand.push(pair.defend); }
        nextAttacker = "bot"; 
      }
    }

    state.attacker = nextAttacker;
    state.tableCards = [];
    state.botTaking = false;
    state.isTransferAllowed = true;

    const drawForUser = () => { while (myData.hand.length < 6 && state.deck.length > 0) myData.hand.push(state.deck.pop()); };
    const drawForBot = () => { while (botData.hand.length < 6 && state.deck.length > 0) botData.hand.push(state.deck.pop()); };

    if (previousAttacker === userId) {
      drawForUser();
      drawForBot();
    } else {
      drawForBot();
      drawForUser();
    }

    if (state.attacker === "bot") {
      botAttackFirstCard(botData, state);
    }

    await checkDurakFinish(ctx, game._id, userId, state, game);
    await ctx.db.patch(game._id, { status: game.status, gameState: state });
  }
});