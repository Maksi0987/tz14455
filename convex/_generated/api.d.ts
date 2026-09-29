import type { FunctionReference, AnyApi } from "convex/server";
export declare const api: {
  todos: {
    getTodos: FunctionReference<"query", "public", {}, any>;
    getStats: FunctionReference<"query", "public", {}, { total: number; completed: number; active: number; percentage: number }>;
    createTodo: FunctionReference<"mutation", "public", { text: string }, any>;
    toggleTodo: FunctionReference<"mutation", "public", { id: any }, any>;
    updateTodo: FunctionReference<"mutation", "public", { id: any; text: string }, any>;
    deleteTodo: FunctionReference<"mutation", "public", { id: any }, any>;
    clearCompleted: FunctionReference<"mutation", "public", {}, { deletedCount: number }>;
    clearAll: FunctionReference<"mutation", "public", {}, { deletedCount: number }>;
  };
  users: {
    currentUser: FunctionReference<"query", "public", {}, any>;
  };
};
export declare const internal: AnyApi;
