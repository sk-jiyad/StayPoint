"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X, ArrowUpRight } from "lucide-react"

const INK = "#15170F"
const PAPER = "#F4F1EA"
const GREEN = "#4F7B1E"
const LINE = "rgba(21,23,15,0.12)"

const navLinks = [
  { label: "Explore", to: "/explore" },
  { label: "Add PG", to: "/add-pg" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(244,241,234,0.95)" : "rgba(255,255,255,0.02)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${LINE}` : "1px solid transparent",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo sp.svg" alt="StayPoint" className="h-36 w-36" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 ff-mono uppercase tracking-[0.15em]" style={{ fontSize: "0.72rem" }}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/signup"
            className="group ff-mono uppercase tracking-[0.15em] hidden md:inline-flex items-center gap-2 px-4 py-2.5 transition-colors"
            style={{ fontSize: "0.72rem", background: INK, color: PAPER }}
          >
            Get started
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
          <nav className="flex flex-col gap-3 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-3 text-sm uppercase tracking-[0.12em] text-slate-900 hover:bg-slate-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/signup"
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-slate-900"
              onClick={() => setIsOpen(false)}
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
