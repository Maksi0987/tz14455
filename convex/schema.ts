import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: authTables.users.index("by_name", ["name"]),
  
  games: defineTable({
    type: v.union(v.literal("blackjack"), v.literal("durak")),
    status: v.union(v.literal("waiting"), v.literal("playing"), v.literal("finished")),
    creatorId: v.id("users"),
    players: v.array(v.id("users")),
    currentTurn: v.optional(v.id("users")),
    gameState: v.any(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  // Нова таблиця для статистики гравця
  playerStats: defineTable({
    userId: v.id("users"),
    wins: v.number(),
    losses: v.number(),
    draws: v.number(),
    xp: v.number(),
    level: v.number(),
    rank: v.string(),
  }).index("by_user", ["userId"]),
});