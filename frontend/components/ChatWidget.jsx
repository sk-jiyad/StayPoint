"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send } from "lucide-react";
import { chatApi } from "../src/lib/api.js";

const GREETING = {
  from: "bot",
  text: "Hi! 👋 I'm the StayPoint assistant. Ask me about PGs or tell me your budget — e.g. \"Suggest a highly rated PG under 6000 for girls with wifi near Jamia\".",
  pgs: [],
};

const SUGGESTIONS = [
  "What is a PG?",
  "Suggest a PG under 6000 for girls with wifi",
  "What documents do I need?",
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
    setMessages((m) => [...m, { from: "user", text: message, pgs: [] }]);
    setLoading(true);
    try {
      const res = await chatApi.send(message);
      setMessages((m) => [...m, { from: "bot", text: res.reply, pgs: res.pgs || [] }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Sorry, I couldn't reach the server. Is the backend running?", pgs: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#87E64B] text-black shadow-lg flex items-center justify-center hover:scale-105 transition"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-[#191919] border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-[#87E64B] text-black px-4 py-3 font-bold flex items-center gap-2">
            <MessageCircle size={18} /> StayPoint Assistant
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block px-3 py-2 rounded-2xl text-sm max-w-[85%] ${
                    m.from === "user"
                      ? "bg-[#87E64B] text-black rounded-br-sm"
                      : "bg-gray-800 text-gray-100 rounded-bl-sm"
                  }`}
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
                        className="block text-left bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 no-underline"
                      >
                        <p className="text-white text-sm font-semibold">{pg.name}</p>
                        <p className="text-[#87E64B] text-xs">
                          ₹{pg.rentSingle}/mo
                          {pg.avgRating != null && ` · ★ ${pg.avgRating.toFixed(1)}`}
                          {pg.verified && " · ✓ Verified"}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="text-gray-500 text-sm">…thinking</p>}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-700 text-gray-300 hover:border-[#87E64B] hover:text-[#87E64B]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-3 border-t border-gray-800 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 bg-[#87E64B] text-black rounded-lg disabled:opacity-60"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
