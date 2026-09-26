import type { MemoryRecord, MemoryStore } from "./types";

const memory: MemoryRecord[] = [];

export const localMemory: MemoryStore = {
  async save(record) {
    memory.unshift({
      ...record,
      id: record.id ?? crypto.randomUUID(),
      createdAt: record.createdAt ?? new Date().toISOString(),
    });
  },

  async recent(kind, limit = 25) {
    return memory
      .filter((item) => !kind || item.kind === kind)
      .slice(0, limit);
  },
};
