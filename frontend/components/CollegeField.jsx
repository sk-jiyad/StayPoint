"use client";

import { useEffect, useRef, useState } from "react";
import { COLLEGES } from "../src/lib/colleges.js";

// A combobox for the "Nearby college" field: autocompletes from the curated list,
// but always lets the owner type their own. When what they've typed isn't in the
// list, a greyed, non-selectable footer row reassures them it'll be saved as typed.
export default function CollegeField({
  value,
  onChange,
  id = "college",
  placeholder = "Search or type your college…",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);

  const q = (value || "").trim().toLowerCase();
  const filtered = q
    ? COLLEGES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8)
    : COLLEGES.slice(0, 8);
  const exactMatch = COLLEGES.some((c) => c.toLowerCase() === q);
  const showHint = q.length > 0 && !exactMatch;

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (c) => {
    onChange(c);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && active >= 0 && active < filtered.length) {
        e.preventDefault();
        pick(filtered[active]);
      } else {
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={className}
      />

      {open && (filtered.length > 0 || showHint) && (
        <ul
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-auto bg-[#1f1f1f] border border-gray-700 rounded-lg shadow-xl list-none m-0 p-0"
        >
          {filtered.map((c, i) => (
            <li
              key={c}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(c);
              }}
              onMouseEnter={() => setActive(i)}
              className={`px-4 py-2 text-sm cursor-pointer ${
                i === active ? "bg-[#87E64B] text-black" : "text-gray-200 hover:bg-gray-800"
              }`}
            >
              {c}
            </li>
          ))}

          {showHint && (
            <li
              aria-disabled="true"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="px-4 py-2 text-xs italic text-gray-500 border-t border-gray-700 cursor-default select-none"
            >
              ✎ Not in the list? “{value.trim()}” will be saved as you typed it.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
