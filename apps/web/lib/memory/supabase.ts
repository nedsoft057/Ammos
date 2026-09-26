import type { MemoryRecord, MemoryStore } from "./types";

export function createSupabaseMemory(): MemoryStore | null {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/ammos_memory`;

  return {
    async save(record: MemoryRecord) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          id: record.id,
          kind: record.kind,
          key: record.key,
          payload: record.payload,
          created_at: record.createdAt ?? new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Supabase memory write failed: ${response.status}`);
      }
    },

    async recent(kind, limit = 25) {
      const query = new URLSearchParams({
        select: "id,kind,key,payload,created_at",
        order: "created_at.desc",
        limit: String(limit),
      });

      if (kind) query.set("kind", `eq.${kind}`);

      const response = await fetch(`${endpoint}?${query}`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Supabase memory read failed: ${response.status}`);
      }

      const rows = await response.json();

      return rows.map((row: {
        id: string;
        kind: MemoryRecord["kind"];
        key: string;
        payload: Record<string, unknown>;
        created_at: string;
      }) => ({
        id: row.id,
        kind: row.kind,
        key: row.key,
        payload: row.payload,
        createdAt: row.created_at,
      }));
    },
  };
}
