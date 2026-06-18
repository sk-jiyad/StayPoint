"use client";

import { useEffect, useRef, useState } from "react";
import { COLLEGES } from "../src/lib/colleges.js";

const PAPER = "#F4F1EA";
const GREEN = "#4F7B1E";
const INK = "#15170F";
const LINE = "rgba(21,23,15,0.12)";

/**
 * "Nearby college" combobox styled to match the editorial theme: autocompletes from a
 * curated list but accepts any typed value. When the typed text isn't an exact match, a
 * greyed footer row reassures the owner it'll be saved as typed.
 */
export default function CollegeCombobox({ value, onChange, placeholder = "Nearby college — search or type your own" }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);

  const q = (value || "").trim().toLowerCase();
  const filtered = (q ? COLLEGES.filter((c) => c.toLowerCase().includes(q)) : COLLEGES).slice(0, 8);
  const exactMatch = COLLEGES.some((c) => c.toLowerCase() === q);
  const showHint = q.length > 0 && !exactMatch;

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (c) => { onChange(c); setOpen(false); setActive(-1); };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { if (open && active >= 0 && active < filtered.length) { e.preventDefault(); pick(filtered[active]); } else setOpen(false); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full p-4 outline-none"
        style={{ background: PAPER, border: `1px solid ${LINE}` }}
      />
      {open && (filtered.length > 0 || showHint) && (
        <ul
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-auto list-none m-0 p-0 shadow-lg"
          style={{ background: PAPER, border: `1px solid ${LINE}` }}
        >
          {filtered.map((c, i) => (
            <li
              key={c}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); pick(c); }}
              onMouseEnter={() => setActive(i)}
              className="px-4 py-2.5 text-sm cursor-pointer"
              style={{ background: i === active ? `${GREEN}1a` : "transparent", color: INK }}
            >
              {c}
            </li>
          ))}
          {showHint && (
            <li
              aria-disabled="true"
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); }}
              className="px-4 py-2.5 text-xs italic cursor-default select-none"
              style={{ color: "#9A9684", borderTop: `1px solid ${LINE}` }}
            >
              ✎ Not in the list? “{value.trim()}” will be saved as you typed it.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
