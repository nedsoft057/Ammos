import type {
  AIReasoningRequest,
  AIReasoningResponse,
} from "./types";

const MODEL =
  process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const schema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    verdict: {
      type: "string",
      enum: ["strong", "watch", "avoid"],
    },
    confidence: { type: "number" },
    thesis: {
      type: "array",
      items: { type: "string" },
    },
    actions: {
      type: "array",
      items: { type: "string" },
    },
    caveats: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "summary",
    "verdict",
    "confidence",
    "thesis",
    "actions",
    "caveats",
  ],
  additionalProperties: false,
};

export async function reasonWithGroq(
  request: AIReasoningRequest,
): Promise<AIReasoningResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) return null;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are AMMOS, a DeFi intelligence analyst. Never invent market facts. The deterministic engine has already calculated the financial metrics. Explain and rank the supplied facts. Do not replace calculations with guesses. Clearly state uncertainty and never present a recommendation as guaranteed.",
          },
          {
            role: "user",
            content: JSON.stringify(request),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "ammos_reasoning",
            strict: true,
            schema,
          },
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Groq request failed: ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned no message content.");
  }

  return JSON.parse(content) as AIReasoningResponse;
}
