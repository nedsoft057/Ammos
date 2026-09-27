import { createSupabaseMemory } from "./supabase";
import { localMemory } from "./local";
import type { MemoryStore } from "./types";

export * from "./types";

export function getMemoryStore(): MemoryStore {
  const supabase = createSupabaseMemory();
  if (!supabase) return localMemory;

  return {
    async save(record) {
      try {
        await supabase.save(record);
      } catch (e) {
        console.error("Supabase memory save failed, falling back silently:", e);
      }
    },
    async recent(kind, limit) {
      try {
        return await supabase.recent(kind, limit);
      } catch (e) {
        console.error("Supabase memory read failed, falling back to empty:", e);
        return [];
      }
    },
  };
}
