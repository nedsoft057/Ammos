"use client";

import { useState } from "react";
import { useWallet } from "./WalletProvider";

type Message = { role: "user" | "assistant"; content: string };
const starters = ["what is AMMOS seeing right now?", "which market deserves attention?", "explain the current risk posture"];

export function ChatPanel() {
  const { address } = useWallet();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "i'm AMMOS. ask me about the live market surface, what is driving a signal, or the risk behind it. i'll separate observed facts from inference and never invent execution." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(text = input) {
    const question = text.trim();
    if (!question || busy) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setBusy(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, address }),
      });
      const payload = await response.json().catch(() => ({}));
      const content = response.ok
        ? String(payload.answer ?? "No answer returned.")
        : String(payload.error ?? "The agent could not answer that right now.");
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "the agent endpoint is unavailable right now. the live UI remains read-only." }]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="chat-launcher" onClick={() => setOpen(true)}>
        <span className="chat-launch-orb"><i /></span>
        <span>Ask AMMOS</span>
        <span className="chat-chevron">↗</span>
      </button>
    );
  }

  return (
    <section className="chat-shell">
      <header className="chat-head">
        <div className="flex items-center gap-3">
          <div className="chat-orb"><i /></div>
          <div>
            <div className="kicker text-[#a99cff]">AMMOS / agent console</div>
            <div className="text-sm mt-1">live reasoning interface</div>
          </div>
        </div>
        <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
      </header>
      <div className="chat-context">
        <span><i className="status-dot" /> live context</span>
        <span>{address ? "wallet context attached" : "read-only market context"}</span>
      </div>
      <div className="chat-body">
        {messages.map((message, i) => (
          <div key={`${message.role}-${i}`} className={`chat-message ${message.role === "assistant" ? "chat-agent" : "chat-user"}`}>
            <div className="chat-role">{message.role === "assistant" ? "AMMOS" : "YOU"}</div>
            <p>{message.content}</p>
          </div>
        ))}
        {messages.length === 1 && (
          <div className="chat-starters">
            {starters.map((starter) => <button key={starter} onClick={() => void send(starter)}>{starter}<span>↗</span></button>)}
          </div>
        )}
        {busy && <div className="chat-typing"><i/><i/><i/> AMMOS is reading the current context</div>}
      </div>
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); void send(); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about the live state…" disabled={busy} />
        <button disabled={busy || !input.trim()} aria-label="Send">↑</button>
      </form>
    </section>
  );
}
