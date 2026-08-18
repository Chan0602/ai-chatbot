"use client";
import { useState, useRef, useEffect } from "react";
import { X, ArrowUp } from "lucide-react";

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
                style={{ color: "#c2185b" }}
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
];

const SLEEP_FRAMES = [
  "/images/cat/cat-sleep-1.png",
  "/images/cat/cat-sleep-2.png",
  "/images/cat/cat-sleep-3.png",
  "/images/cat/cat-sleep-4.png",
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const closeChat = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setCatHover(false);
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

  const [catHover, setCatHover] = useState(false);
  const [sleepFrame, setSleepFrame] = useState(0);

  useEffect(() => {
    if (open || catHover) return;
    const id = setInterval(() => {
      setSleepFrame((f) => (f + 1) % SLEEP_FRAMES.length);
    }, 700);
    return () => clearInterval(id);
  }, [open, catHover]);

  return (
    <>
      {/* Floating cat entry */}
      {!open && (
        <div
          className="fixed bottom-6 right-6 flex flex-col items-end"
          style={{ zIndex: 40 }}
        >
          {/* Hello bubble on hover */}
          {catHover && (
            <div
              className="mb-2 px-3 py-2 rounded-2xl text-[13px]"
              style={{
                background: "#fff",
                color: "#3d5d47",
                border: "1px solid #f0d9e6",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                animation: "fadeUp 0.2s ease-out",
              }}
            >
              ask me anything...
            </div>
          )}

          <button
            onClick={() => setOpen(true)}
            onMouseEnter={() => setCatHover(true)}
            onMouseLeave={() => setCatHover(false)}
            onMouseDown={() => setCatHover(true)}
            onTouchStart={() => setCatHover(true)}
            aria-label="Open chat with the site cat"
            aria-expanded={false}
            className="flex items-end justify-center active:scale-90"
            style={{
              width: 132,
              height: 88,
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          >
            {/* Cat image itself is the entry point, no container */}
            {/* cat-sitting.png stands in for the "up" pose until that asset is provided */}
            <img
              src={catHover ? "/images/cat/cat-sitting.png" : SLEEP_FRAMES[sleepFrame]}
              alt=""
              draggable={false}
              style={{
                width: catHover ? 88 : 132,
                height: catHover ? 88 : 60,
                objectFit: "contain",
                pointerEvents: "none",
                transition: "transform 0.2s ease-out",
                transform: catHover ? "scale(1.05)" : "scale(1)",
              }}
            />
          </button>
        </div>
      )}

      {/* Chat popup */}
      {open && (
        <div
          className="fixed bottom-6 right-6 flex flex-col overflow-hidden bg-[#ffffff] rounded-[26px_22px_24px_20px]"
          style={{
            width: 320,
            height: 520,
            maxHeight: "80vh",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.18)",
            animation: closing
              ? "popOut 0.3s cubic-bezier(0.55, 0, 1, 0.45) forwards"
              : "popIn 0.35s cubic-bezier(0.34, 1.2, 0.64, 1)",
          }}
        >
          {/* Header */}
          <div className="shrink-0 flex justify-end px-4 pt-4 pb-2">
            <button
              onClick={closeChat}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#ffffff] hover:bg-[#efe9dc] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-[#1a1a1a]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 scrollbar-none">
            {/* Greeting */}
            <div className="flex justify-start">
              <div
                className="max-w-[82%] px-5 py-3 text-[#4a4a4a] rounded-[26px_24px_26px_22px] bg-white border border-[#e2e2e2]"
              >
                <p className="text-[17px] leading-snug">
                  Hi there! 👋 I&apos;m your design assistant. Ask me anything about my background, skills, or projects :)
                </p>
                <p className="text-[12px] mt-1 text-[#9a9a9a]">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div
                    className="max-w-[82%] px-5 py-3 text-[#4a4a4a] rounded-[26px_24px_26px_22px] bg-[#f9ddd2]"
                  >
                    <p className="text-[17px] leading-snug">{m.text}</p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex flex-col items-start gap-2">
                  <div
                    className="max-w-[82%] px-5 py-3 text-[#4a4a4a] rounded-[26px_24px_26px_22px] bg-white border border-[#e2e2e2]"
                  >
                    <div className="text-[17px] leading-snug">{renderWithLinks(m.text)}</div>
                  </div>
                  {m.links && m.links.length > 0 && (
                    <div className="flex flex-col gap-3 w-[268px]">
                      {m.links.map((link, li) => (
                        <a
                          key={li}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-card no-underline block bg-white rounded-[18px_16px_18px_14px] overflow-hidden border border-[#e2e2e2]"
                        >
                          {/* Image */}
                          <div style={{ height: 136, background: "#f3f0e7", overflow: "hidden" }}>
                            {link.image ? (
                              <img
                                src={link.image}
                                alt={link.label}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: "#ffe1ec" }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <path d="M4 24l8-8 5 5 5-6 6 9H4Z" fill="#1a1a1a" opacity="0.3" />
                                  <circle cx="21" cy="11" r="3" fill="#1a1a1a" opacity="0.3" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Label + tags */}
                          <div className="px-4 py-3 flex flex-col gap-2">
                            <span className="text-[16px] text-[#1a1a1a]">{link.label}</span>
                            {link.tags && link.tags.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {link.tags.map((tag, ti) => (
                                  <span
                                    key={ti}
                                    className="px-2 py-0.5 rounded-full text-[12px] text-[#4a4a4a] bg-[#f3f0e7]"
                                  >
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
              <div className="flex justify-start">
                <div
                  className="px-5 py-3 rounded-[26px_24px_26px_22px] bg-white border border-[#e2e2e2]"
                >
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="block rounded-full"
                        style={{
                          width: 6,
                          height: 6,
                          background: "#9a9a9a",
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
          <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="shrink-0 px-4 py-2 text-[15px] text-[#1a1a1a] rounded-[16px_14px_16px_12px] bg-[#ffe1ec] hover:bg-[#ffd0e2] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="shrink-0 flex items-center gap-3 px-4 py-4 bg-[#ffffff]"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 text-[16px] text-[#1a1a1a] placeholder:text-[#9a9a9a] bg-[#ffffff] rounded-[20px_18px_20px_16px] outline-none border border-[#e2e2e2]"
            />
            <button
              type="submit"
              className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-[#c8f0d2] hover:bg-[#b2e8bf] transition-colors"
              aria-label="Send"
            >
              <ArrowUp className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2.5} />
            </button>
          </form>
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .project-card { transition: all 0.2s ease; cursor: pointer; }
        .project-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important; }
        .project-card:active { transform: translateY(0); }
      `}</style>
    </>
  );
}
