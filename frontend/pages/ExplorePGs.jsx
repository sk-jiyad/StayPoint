"use client";

import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Wifi,
  UtensilsCrossed,
  Snowflake,
  Droplet,
  Car,
  Bath,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { pgApi, ApiError } from "../src/lib/api.js";
import { toCard, STATUS_LABEL } from "../src/lib/pgView.js";

/* Brand constants matching Landing Page */
const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LIME = "#C7F04A";
const LINE = "rgba(21,23,15,0.12)";

const amenityIcons = {
  wifi: <Wifi size={14} />,
  food: <UtensilsCrossed size={14} />,
  ac: <Snowflake size={14} />,
  laundry: <Droplet size={14} />,
  parking: <Car size={14} />,
  bath: <Bath size={14} />,
};

export default function ExplorePGs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Rent (Low→High)");
  const [filters, setFilters] = useState({
    rentMax: 20000,
    gender: "all",
    college: "all",
    vacancy: false,
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    pgApi
      .list()
      .then((data) => {
        if (!active) return;
        setPgs(data.map(toCard));
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Could not reach the server. Is the backend running?");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const colleges = useMemo(
    () => [...new Set(pgs.map((p) => p.college).filter(Boolean))].sort(),
    [pgs]
  );

  const getStatusStyles = (status) => {
    switch (status) {
      case "vacant":
        return { background: GREEN, color: PAPER };
      case "full":
        return { background: "#D94040", color: PAPER };
      case "few":
        return { background: "#D08A00", color: PAPER };
      default:
        return { background: "#EAE8DF", color: "#6B6A5C" };
    }
  };

  const filteredPGs = useMemo(() => {
    let data = [...pgs];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (pg) =>
          pg.name.toLowerCase().includes(term) ||
          (pg.college || "").toLowerCase().includes(term) ||
          (pg.address || "").toLowerCase().includes(term) ||
          (pg.city || "").toLowerCase().includes(term)
      );
    }

    data = data.filter((pg) => Number(pg.rent) <= filters.rentMax);

    if (filters.gender !== "all") {
      data = data.filter((pg) => pg.gender === filters.gender);
    }

    if (filters.college !== "all") {
      data = data.filter((pg) => pg.college === filters.college);
    }

    if (filters.vacancy) {
      data = data.filter((pg) => pg.status === "vacant" || pg.status === "few");
    }

    switch (sortBy) {
      case "Rent (Low→High)":
        data.sort((a, b) => a.rent - b.rent);
        break;
      case "Rent (High→Low)":
        data.sort((a, b) => b.rent - a.rent);
        break;
      case "Top rated":
        data.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "Newest":
        data.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return data;
  }, [pgs, searchTerm, filters, sortBy]);

  return (
    <div className="min-h-screen antialiased pt-28 pb-24 overflow-x-hidden" style={{ background: PAPER, color: INK }}>
      <style>{`
        ::selection { background: ${GREEN}; color: ${PAPER}; }
        .ff-display { font-family: var(--font-display); font-optical-sizing: auto; }
        .ff-mono { font-family: var(--font-mono); }
      `}</style>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* ====================== HEADER & SEARCH ====================== */}
        <div className="mb-8">
          <h1 className="ff-display" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1, letterSpacing: "-0.03em", fontWeight: 500 }}>
            Explore <span className="italic text-[#9A9684]" style={{ fontWeight: 400 }}>PGs</span>
          </h1>

          <div className="mt-6 flex items-center gap-3 w-full p-2" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search size={18} style={{ color: GREEN }} className="shrink-0" />
              <input
                type="text"
                placeholder="Search PG by college, name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none py-3 text-sm md:text-base"
                style={{ color: INK }}
              />
            </div>
          </div>
        </div>

        {/* ====================== HORIZONTAL FILTERS ====================== */}
        <div className="mb-10 p-5 md:p-6" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="ff-mono uppercase tracking-[0.18em]" style={{ fontSize: "0.8rem", color: INK }}>Filters</h2>
            <label className="hidden md:flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.vacancy}
                onChange={(e) => setFilters({ ...filters, vacancy: e.target.checked })}
                className="w-4 h-4"
                style={{ accentColor: GREEN }}
              />
              <span className="ff-mono uppercase tracking-[0.1em]" style={{ fontSize: "0.7rem", color: INK }}>
                Show only available
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
            {/* Rent Filter */}
            <div className="w-full">
              <label className="flex justify-between items-center ff-mono tracking-[0.05em] mb-3" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>
                <span>Max Rent</span>
                <span style={{ color: INK }}>₹{filters.rentMax}</span>
              </label>
              <input
                type="range"
                min="2000"
                max="20000"
                step="500"
                value={filters.rentMax}
                onChange={(e) => setFilters({ ...filters, rentMax: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: GREEN }}
              />
            </div>

            {/* Gender Filter */}
            <div className="w-full">
              <label className="block ff-mono tracking-[0.05em] mb-3" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full px-4 py-2.5 outline-none appearance-none"
                style={{ background: PAPER, border: `1px solid ${LINE}`, color: INK, fontSize: "0.9rem" }}
              >
                <option value="all">Any Gender</option>
                <option value="boys">Boys Only</option>
                <option value="girls">Girls Only</option>
                <option value="coed">Co-ed</option>
              </select>
            </div>

            {/* College Filter */}
            <div className="w-full">
              <label className="block ff-mono tracking-[0.05em] mb-3" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>Near College</label>
              <select
                value={filters.college}
                onChange={(e) => setFilters({ ...filters, college: e.target.value })}
                className="w-full px-4 py-2.5 outline-none appearance-none"
                style={{ background: PAPER, border: `1px solid ${LINE}`, color: INK, fontSize: "0.9rem" }}
              >
                <option value="all">Any College</option>
                {colleges.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="w-full">
              <label className="block ff-mono tracking-[0.05em] mb-3" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 outline-none appearance-none"
                style={{ background: PAPER, border: `1px solid ${LINE}`, color: INK, fontSize: "0.9rem" }}
              >
                <option>Rent (Low→High)</option>
                <option>Rent (High→Low)</option>
                <option>Top rated</option>
                <option>Newest</option>
              </select>
            </div>

            {/* Vacancy Toggle (Mobile Only) */}
            <div className="md:hidden pt-2 w-full">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.vacancy}
                  onChange={(e) => setFilters({ ...filters, vacancy: e.target.checked })}
                  className="w-4 h-4"
                  style={{ accentColor: GREEN }}
                />
                <span className="ff-mono uppercase tracking-[0.1em]" style={{ fontSize: "0.7rem", color: INK }}>
                  Show only available
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ====================== LISTINGS AREA ====================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="ff-mono uppercase tracking-[0.1em]" style={{ fontSize: "0.7rem", color: "#6B6A5C" }}>
            {loading ? "Loading…" : `Showing ${filteredPGs.length} stays`}
          </div>
        </div>

        {/* States */}
        {loading && (
          <p className="ff-mono uppercase tracking-[0.1em] text-center py-24" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>
            Loading listings…
          </p>
        )}

        {!loading && error && (
          <div className="w-full py-16 text-center" style={{ border: `1px solid rgba(217,64,64,0.3)`, background: "rgba(217,64,64,0.06)" }}>
            <p className="ff-mono uppercase tracking-[0.1em]" style={{ fontSize: "0.75rem", color: "#D94040" }}>{error}</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredPGs.length === 0 && (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center" style={{ border: `1px dashed ${LINE}`, background: PANEL }}>
            <span className="ff-display" style={{ fontSize: "2rem", color: "#9A9684" }}>
              {pgs.length === 0 ? "No PGs listed yet" : "No matches found"}
            </span>
            <p className="mt-2 ff-mono uppercase tracking-[0.1em]" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>
              {pgs.length === 0 ? "Be the first owner to list one." : "Try adjusting your filters to see more results."}
            </p>
          </div>
        )}

        {!loading && !error && filteredPGs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPGs.map((pg) => (
              <div key={pg.id} className="group flex flex-col transition-colors" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
                {/* Card Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAE8DF]" style={{ borderBottom: `1px solid ${LINE}` }}>
                  {pg.image ? (
                    <img
                      src={pg.image}
                      alt={pg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full grid place-content-center" style={{ color: "#9A9684" }}>
                      <MapPin size={28} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {pg.gender && (
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm ff-mono uppercase tracking-[0.1em]" style={{ fontSize: "0.6rem", color: INK }}>
                        {pg.gender}
                      </span>
                    )}
                    {pg.verified && (
                      <span className="px-2.5 py-1.5 ff-mono uppercase tracking-[0.1em] inline-flex items-center gap-1" style={{ fontSize: "0.6rem", background: GREEN, color: PAPER }}>
                        <ShieldCheck size={11} /> Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h3 className="ff-display truncate" style={{ fontSize: "1.4rem", fontWeight: 500, letterSpacing: "-0.01em" }}>
                        {pg.name}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-1" style={{ color: "#6B6A5C", fontSize: "0.85rem" }}>
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{pg.address}{pg.city ? `, ${pg.city}` : ""}</span>
                      </div>
                    </div>
                    {pg.status && (
                      <span className="px-2.5 py-1.5 ff-mono uppercase tracking-[0.1em] whitespace-nowrap shrink-0" style={{ fontSize: "0.6rem", ...getStatusStyles(pg.status) }}>
                        {STATUS_LABEL[pg.status]}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pb-4 flex items-end justify-between gap-2" style={{ borderBottom: `1px solid ${LINE}` }}>
                    <div className="flex items-end gap-1">
                      <span className="ff-display" style={{ fontSize: "1.8rem", fontWeight: 500, lineHeight: 1 }}>₹{pg.rent}</span>
                      <span className="mb-1" style={{ fontSize: "0.85rem", color: "#6B6A5C" }}>/mo</span>
                    </div>
                    {pg.rating != null && (
                      <span className="inline-flex items-center gap-1 ff-mono" style={{ fontSize: "0.8rem", color: "#54533F" }}>
                        <Star size={13} style={{ color: GREEN, fill: GREEN }} />
                        {pg.rating.toFixed(1)} <span style={{ color: "#9A9684" }}>({pg.reviewCount})</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 flex-1">
                    {pg.college && (
                      <div className="flex items-center gap-2" style={{ color: "#54533F", fontSize: "0.85rem" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: LINE }} />
                        Near {pg.college}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pg.amenities.map((a) => (
                        <span key={a.key} className="flex items-center justify-center p-2 rounded-sm" style={{ border: `1px solid ${LINE}`, color: "#6B6A5C", background: PAPER }} title={a.label}>
                          {amenityIcons[a.key]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={`/pg/${pg.id}`}
                    className="mt-6 w-full flex items-center justify-between px-5 py-3.5 ff-mono uppercase tracking-[0.15em] transition-colors hover:opacity-90"
                    style={{ fontSize: "0.74rem", background: INK, color: PAPER }}
                  >
                    View Details
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
