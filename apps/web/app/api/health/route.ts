import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ammos",
    ai: Boolean(process.env.GROQ_API_KEY),
    memory: Boolean(process.env.SUPABASE_URL),
    timestamp: new Date().toISOString(),
  });
}
