import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todos").withIndex("by_creation_time").order("desc").collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("todos").collect();
    const total = all.length;
    const completed = all.filter((t) => t.isCompleted).length;
    const active = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, active, percentage };
  },
});

export const createTodo = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const text = args.text.trim();
    if (!text) throw new ConvexError("Текст не може бути порожнім");
    return await ctx.db.insert("todos", { text, isCompleted: false, createdAt: Date.now() });
  },
});

export const toggleTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new ConvexError("Не знайдено");
    await ctx.db.patch(args.id, { isCompleted: !item.isCompleted });
  },
});

export const updateTodo = mutation({
  args: { id: v.id("todos"), text: v.string() },
  handler: async (ctx, args) => {
    const text = args.text.trim();
    if (!text) throw new ConvexError("Текст не може бути порожнім");
    await ctx.db.patch(args.id, { text });
  },
});

export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clearCompleted = mutation({
  args: {},
  handler: async (ctx) => {
    const completed = await ctx.db.query("todos").withIndex("by_completion", (q) => q.eq("isCompleted", true)).collect();
    for (const t of completed) await ctx.db.delete(t._id);
    return { deletedCount: completed.length };
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("todos").collect();
    for (const t of all) await ctx.db.delete(t._id);
    return { deletedCount: all.length };
  },
});
