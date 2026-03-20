"use client";
import { useState, useRef, useEffect } from "react";

function renderWithLinks(text: string) {
  return text.split("\n").map((line, lineIdx, arr) => {
    const parts = line.split(/(<a\s+href=["'][^"']*["'][^>]*>.*?<\/a>)/gi);
    const rendered = parts.map((part, i) => {
      const match = part.match(/^<a\s+href=["']([^"']*)["'][^>]*>(.*?)<\/a>$/i);
      if (match) {
        const href = match[1].trim();
        const label = match[2];
        if (/^https?:\/\//.test(href)) {
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline opacity-90 hover:opacity-100"
              style={{ color: "#e8b4d0" }}
            >
              {label}
            </a>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
    return (
      <span key={lineIdx}>
        {rendered}
        {lineIdx < arr.length - 1 && <br />}
      </span>
    );
  });
}

const QUICK_PROMPTS = [
  "Tell me about yourself",
  "SaaS B2B",
  "UX design",
  "UX research",
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div
        className="flex flex-col overflow-hidden rounded-3xl shadow-2xl bg-white"
        style={{ width: 384, height: 600 }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-6 py-4"
          style={{
            background: "linear-gradient(169deg, #3d5d47 0%, #2a4032 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 40, height: 40, background: "#e8b4d0" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L11.8 7.2L17 9L11.8 10.8L10 16L8.2 10.8L3 9L8.2 7.2L10 2Z"
                  fill="#3d5d47"
                />
                <circle cx="15" cy="4" r="1.5" fill="#3d5d47" />
                <circle cx="5" cy="15" r="1" fill="#3d5d47" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-[18px] leading-tight tracking-tight">
                Design Assistant
              </p>
              <p className="text-[12px] leading-tight" style={{ color: "rgba(255,255,255,0.8)" }}>
                Always here to help
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center rounded-full opacity-70 hover:opacity-100 transition-opacity"
              style={{ width: 32, height: 32 }}
              aria-label="Minimize"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="flex items-center justify-center rounded-full opacity-70 hover:opacity-100 transition-opacity"
              style={{ width: 32, height: 32 }}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3"
          style={{ background: "#f8f8f8" }}
        >
          {/* Initial greeting */}
          <div className="flex items-end gap-2">
            <div
              className="rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md px-4 py-3 max-w-[70%]"
              style={{ background: "#3d5d47" }}
            >
              <p className="text-white text-[14px] leading-snug">
                Hi there! 👋 I&apos;m your design assistant. Ask me anything about my background, skills, or projects :)
              </p>
              <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div
                  className="rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md px-4 py-3 max-w-[70%]"
                  style={{ background: "#e8b4d0" }}
                >
                  <p className="text-[#2a4032] text-[14px] leading-snug">{m.text}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-end gap-2">
                <div
                  className="rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md px-4 py-3 max-w-[70%]"
                  style={{ background: "#3d5d47" }}
                >
                  <p className="text-white text-[14px] leading-snug">{renderWithLinks(m.text)}</p>
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="flex items-end gap-2">
              <div
                className="rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md px-4 py-3"
                style={{ background: "#3d5d47" }}
              >
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block rounded-full"
                      style={{
                        width: 6,
                        height: 6,
                        background: "rgba(255,255,255,0.7)",
                        animation: `bounce 1.2s ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div
          className="shrink-0 flex gap-2 px-6 py-3 overflow-x-auto scrollbar-none border-t"
          style={{ borderColor: "#f3f4f6" }}
        >
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-80"
              style={{ background: "#e8b4d0", color: "#3d5d47" }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          className="shrink-0 flex items-center gap-2 px-4 py-4 border-t bg-white"
          style={{ borderColor: "#f3f4f6" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 rounded-full px-4 py-3 text-[15px] outline-none border-2 transition-colors"
            style={{
              background: "#f9f9f9",
              borderColor: "#e5e5e5",
              color: "#0a0a0a",
            }}
          />
          <button
            onClick={() => sendMessage()}
            className="shrink-0 flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #3d5d47 0%, #2a4032 100%)",
            }}
            aria-label="Send"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M18 10L3 3L6.5 10L3 17L18 10Z"
                fill="white"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
