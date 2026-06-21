"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send, Star, ShieldCheck } from "lucide-react";
import { chatApi } from "../src/lib/api.js";

const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LIME = "#C7F04A";
const LINE = "rgba(21,23,15,0.12)";

const GREETING = {
  from: "bot",
  text: "Hi! I'm Quanta 🏠 — your StayPoint PG assistant. Ask me about PGs, or tell me your budget — e.g. \"a highly rated PG under 6000 for girls with wifi near Jamia\". I understand English, हिंदी and বাংলা.",
  pgs: [],
};

const SUGGESTIONS = [
  "Suggest a PG under 6000 for girls with wifi",
  "What documents do I need?",
  "6000 ke andar wifi wala PG batao",
  "Asansol e sosta PG dekhao",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    setInput("");
    const history = messages.slice(-8).map((m) => ({ role: m.from === "user" ? "user" : "model", text: m.text }));
    // PGs shown in the most recent bot turn — sent so follow-ups ("which is cheapest?") resolve.
    const lastBot = [...messages].reverse().find((m) => m.from === "bot" && m.pgs && m.pgs.length);
    const lastPgs = lastBot ? lastBot.pgs : [];
    setMessages((m) => [...m, { from: "user", text: message, pgs: [] }]);
    setLoading(true);
    try {
      const res = await chatApi.send(message, history, lastPgs);
      setMessages((m) => [...m, { from: "bot", text: res.reply, pgs: res.pgs || [] }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Sorry, I couldn't reach the server right now.", pgs: [] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        style={{ background: INK, color: LIME }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] flex flex-col shadow-2xl overflow-hidden"
          style={{ background: PANEL, border: `1px solid ${LINE}` }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: INK, color: PAPER }}>
            <MessageCircle size={16} />
            <span className="ff-mono uppercase tracking-[0.15em]" style={{ fontSize: "0.7rem" }}>Quanta · StayPoint Assistant</span>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 space-y-3" style={{ background: PAPER }}>
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
                <div
                  className="inline-block px-3 py-2 text-sm max-w-[85%]"
                  style={m.from === "user" ? { background: GREEN, color: PAPER } : { background: PANEL, color: INK, border: `1px solid ${LINE}` }}
                >
                  {m.text}
                </div>
                {m.pgs && m.pgs.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.pgs.map((pg) => (
                      <Link
                        key={pg.id}
                        to={`/pg/${pg.id}`}
                        onClick={() => setOpen(false)}
                        className="block text-left px-3 py-2 no-underline"
                        style={{ background: PANEL, border: `1px solid ${LINE}` }}
                      >
                        <p className="ff-display" style={{ fontSize: "1rem", color: INK }}>{pg.name}</p>
                        <p className="ff-mono flex items-center gap-2" style={{ fontSize: "0.7rem", color: "#6B6A5C" }}>
                          ₹{pg.rentSingle}/mo
                          {pg.avgRating != null && <span className="inline-flex items-center gap-0.5"><Star size={10} style={{ color: GREEN, fill: GREEN }} /> {pg.avgRating.toFixed(1)}</span>}
                          {pg.verified && <span className="inline-flex items-center gap-0.5" style={{ color: GREEN }}><ShieldCheck size={10} /> Verified</span>}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="ff-mono" style={{ fontSize: "0.7rem", color: "#9A9684" }}>…thinking</p>}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 py-2 flex flex-wrap gap-2" style={{ background: PAPER, borderTop: `1px solid ${LINE}` }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="ff-mono px-2.5 py-1 transition-colors" style={{ fontSize: "0.65rem", border: `1px solid ${LINE}`, color: "#54533F", background: PANEL }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 flex gap-2" style={{ borderTop: `1px solid ${LINE}`, background: PANEL }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="flex-1 px-3 py-2 outline-none text-sm"
              style={{ background: PAPER, border: `1px solid ${LINE}`, color: INK }}
            />
            <button type="submit" disabled={loading} className="px-3 py-2 disabled:opacity-60" style={{ background: INK, color: PAPER }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
