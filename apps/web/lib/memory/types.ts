export type MemoryRecord = {
  id?: string;
  kind: "observation" | "strategy" | "outcome" | "agent_run";
  key: string;
  payload: Record<string, unknown>;
  createdAt?: string;
};

export type MemoryStore = {
  save(record: MemoryRecord): Promise<void>;
  recent(kind?: MemoryRecord["kind"], limit?: number): Promise<MemoryRecord[]>;
};
