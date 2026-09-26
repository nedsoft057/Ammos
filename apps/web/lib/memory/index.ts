import { createSupabaseMemory } from "./supabase";
import { localMemory } from "./local";

export * from "./types";

export function getMemoryStore() {
  return createSupabaseMemory() ?? localMemory;
}
