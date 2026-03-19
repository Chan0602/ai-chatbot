"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);

  const sendMessage = async () => {
    if (!input) return;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "user", text: input },
        { role: "ai", text: data.reply },
      ]);

      setInput("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>Yilin AI 🤖</h1>

      <div style={{ marginBottom: 20 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <b>{m.role}:</b> {m.text}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
        style={{ width: "70%", marginRight: 10 }}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}