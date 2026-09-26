import type {
  AIReasoningRequest,
  AIReasoningResponse,
} from "./types";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const schema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    verdict: { type: "string", enum: ["strong", "watch", "avoid"] },
    confidence: { type: "number" },
    thesis: { type: "array", items: { type: "string" } },
    actions: { type: "array", items: { type: "string" } },
    caveats: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "verdict", "confidence", "thesis", "actions", "caveats"],
  additionalProperties: false,
};

type ChatRequest = {
  question: string;
  context: Record<string, unknown>;
};

export async function chatWithGroq(request: ChatRequest): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.15,
      messages: [
        {
          role: "system",
          content: [
            "You are AMMOS, an onchain capital intelligence agent.",
            "Think from the supplied live context; do not merely repeat it.",
            "Separate observed facts, inference, uncertainty, and action boundaries.",
            "Compare markets when useful, explain why something ranks well or poorly, and challenge weak assumptions in the user's question.",
            "Never invent balances, positions, APYs, protocol states, transaction results, prices, or unsupported facts.",
            "If the context is insufficient, say exactly what is missing.",
            "Never claim a transaction was executed. AMMOS is read-only until a connected wallet signs a protocol-specific transaction.",
            "Do not give guaranteed financial outcomes. Keep answers concise but substantive.",
          ].join(" "),
        },
        {
          role: "user",
          content: `LIVE AMMOS CONTEXT:\n${JSON.stringify(request.context)}\n\nUSER QUESTION:\n${request.question}`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Groq request failed: ${response.status}`);
  const payload = await response.json();
  const answer = payload?.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) throw new Error("Groq returned no message content.");
  return answer.trim();
}

export async function reasonWithGroq(request: AIReasoningRequest): Promise<AIReasoningResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are AMMOS, a DeFi intelligence analyst. Never invent market facts. The deterministic engine has already calculated the financial metrics. Explain and rank the supplied facts. Do not replace calculations with guesses. Clearly state uncertainty and never present a recommendation as guaranteed.",
        },
        { role: "user", content: JSON.stringify(request) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "ammos_reasoning", strict: true, schema },
      },
    }),
  });

  if (!response.ok) throw new Error(`Groq request failed: ${response.status}`);
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no message content.");
  return JSON.parse(content) as AIReasoningResponse;
}
