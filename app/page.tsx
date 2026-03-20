"use client";
import { useState, useRef, useEffect } from "react";

function renderLine(line: string, key: number) {
  const parts = line.split(/(<a\s+href=["'][^"']*["'][^>]*>.*?<\/a>)/gi);
  return (
    <span key={key}>
      {parts.map((part, i) => {
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
      })}
    </span>
  );
}

function renderWithLinks(text: string) {
  return text.split("\n\n").map((para, pIdx, paras) => (
    <p key={pIdx} style={{ margin: pIdx < paras.length - 1 ? "0 0 8px 0" : "0" }}>
      {para.split("\n").map((line, lIdx, lines) => (
        <span key={lIdx}>
          {renderLine(line, lIdx)}
          {lIdx < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  ));
}

const QUICK_PROMPTS = [
  "Tell me about yourself",
  "SaaS B2B",
  "UX design",
  "UX research",
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const closeChat = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 300);
  };
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string; links?: { label: string; url: string; image?: string; tags?: string[] }[] }[]>([]);
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
      setMessages((prev) => [...prev, { role: "ai", text: data.reply, links: data.links ?? [] }]);
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
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 flex items-center justify-center rounded-full transition-all duration-300 ease-out hover:scale-110 hover:brightness-95 active:scale-90 active:brightness-90"
          style={{
            width: 64,
            height: 64,
            background: "#e8b4d0",
          }}
        >
          {/* Chat bubble icon */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 4C8.477 4 4 8.03 4 13c0 2.386.98 4.557 2.586 6.172L5.5 23.5l4.672-1.563A10.8 10.8 0 0014 22c5.523 0 10-4.03 10-9s-4.477-9-10-9Z"
              stroke="#3d5d47"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </button>
      )}

      {/* Chat popup */}
      {open && (
        <div
          className="fixed bottom-6 right-6 flex flex-col overflow-hidden rounded-3xl bg-white"
          style={{
            width: 384,
            height: 600,
            boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.25)",
            animation: closing
              ? "popOut 0.3s cubic-bezier(0.55, 0, 1, 0.45) forwards"
              : "popIn 0.35s cubic-bezier(0.34, 1.2, 0.64, 1)",
          }}
        >
          {/* Header */}
          <div
            className="shrink-0 flex items-center justify-between px-6 py-4"
            style={{ background: "linear-gradient(169deg, #3d5d47 0%, #2a4032 100%)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 40, height: 40, background: "#e8b4d0" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L11.8 7.2L17 9L11.8 10.8L10 16L8.2 10.8L3 9L8.2 7.2L10 2Z" fill="#3d5d47" />
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
            {/* Close */}
            <button
              onClick={closeChat}
              className="close-btn flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32 }}
              aria-label="Close"
            >
              <svg className="close-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 scrollbar-none"
            style={{ background: "#f8f8f8" }}
          >
            {/* Greeting */}
            <div className="flex items-end">
              <div
                className="rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md px-4 py-3 max-w-[75%]"
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
                    className="rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md px-4 py-3 max-w-[75%]"
                    style={{ background: "#e8b4d0" }}
                  >
                    <p className="text-[#2a4032] text-[14px] leading-snug">{m.text}</p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex flex-col items-start gap-2">
                  <div
                    className="rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md px-4 py-3 max-w-[75%]"
                    style={{ background: "#3d5d47" }}
                  >
                    <p className="text-white text-[14px] leading-snug">{renderWithLinks(m.text)}</p>
                  </div>
                  {m.links && m.links.length > 0 && (
                    <div className="flex flex-col gap-3 w-[268px]">
                      {m.links.map((link, li) => (
                        <a
                          key={li}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-card no-underline block"
                          style={{
                            background: "#fff",
                            border: "1px solid #e8e8e8",
                            borderRadius: 14,
                            overflow: "hidden",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
                          }}
                        >
                          {/* Image */}
                          <div style={{ height: 136, background: "#f3f4f6", overflow: "hidden" }}>
                            {link.image ? (
                              <img
                                src={link.image}
                                alt={link.label}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: "#e8b4d0" }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <path d="M4 24l8-8 5 5 5-6 6 9H4Z" fill="#3d5d47" opacity="0.3" />
                                  <circle cx="21" cy="11" r="3" fill="#3d5d47" opacity="0.3" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Label + tags */}
                          <div className="px-4 py-3 flex flex-col gap-2">
                            <span className="text-[13px] font-semibold" style={{ color: "#2a4032" }}>
                              {link.label}
                            </span>
                            {link.tags && link.tags.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {link.tags.map((tag, ti) => (
                                  <span
                                    key={ti}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                                    style={{ background: "#f3f4f6", color: "#6b7280" }}
                                  >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                      <path d="M1 5.5L1.5 2H5L8.5 5.5L5.5 8.5L2 5Z" stroke="#9ca3af" strokeWidth="0.8" fill="none" strokeLinejoin="round" />
                                    </svg>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {loading && (
              <div className="flex items-end">
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
              style={{ background: "#f9f9f9", borderColor: "#e5e5e5", color: "#0a0a0a" }}
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
                <path d="M18 10L3 3L6.5 10L3 17L18 10Z" fill="white" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.1); transform-origin: bottom right; }
          to   { opacity: 1; transform: scale(1);   transform-origin: bottom right; }
        }
        @keyframes popOut {
          from { opacity: 1; transform: scale(1);   transform-origin: bottom right; }
          to   { opacity: 0; transform: scale(0.05); transform-origin: bottom right; }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .project-card { transition: all 0.2s ease; cursor: pointer; }
        .project-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important; }
        .project-card:active { transform: translateY(0); }
        .close-icon { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .close-btn:hover .close-icon { transform: rotate(90deg); }
        .close-btn:active .close-icon { transform: rotate(90deg) scale(0.85); }
      `}</style>
    </>
  );
}
