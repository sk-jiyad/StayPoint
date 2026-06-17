"use client";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Wifi,
  UtensilsCrossed,
  Snowflake,
  Droplet,
  ArrowRight,
  MapPin,
  LayoutGrid,
  Map as MapIcon
} from "lucide-react";

/* Brand constants matching Landing Page */
const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LIME = "#C7F04A";
const LINE = "rgba(21,23,15,0.12)";

export default function ExplorePGs() {
  const [view, setView] = useState("grid"); // 'grid' | 'map'
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Rent (Low→High)");
  const [filters, setFilters] = useState({
    rentMin: 5000,
    rentMax: 20000,
    gender: "all",
    distance: 10,
    vacancy: false,
  });

  // Mock data - ready for backend injection
  const pgListings = [
    {
      id: 1,
      name: "Adhya PG",
      address: "Beside Aayakar Bhawan, Gobindpur",
      rent: 6000,
      college: "Asansol Engineering College",
      available: 3,
      gender: "girls",
      status: "vacant",
      distance: 2.5,
      amenities: ["wifi", "food", "ac"],
    },
    {
      id: 2,
      name: "Lok Santosh PG",
      address: "GT Road, Ushagram",
      rent: 5200,
      college: "BB College",
      available: 5,
      gender: "boys",
      status: "vacant",
      distance: 3.4,
      amenities: ["wifi", "laundry", "food"],
    },
    {
      id: 3,
      name: "Malobika Girls PG",
      address: "B B College Road, Ushagram",
      rent: 7000,
      college: "BB College",
      available: 1,
      gender: "girls",
      status: "few",
      distance: 2.9,
      amenities: ["wifi", "food", "ac"],
    },
    {
      id: 4,
      name: "Arun PG",
      address: "Gobindapur Road, Asansol",
      rent: 6500,
      college: "Asansol Engineering College",
      available: 5,
      gender: "boys",
      status: "vacant",
      distance: 1.5,
      amenities: ["wifi", "food"],
    },
    {
      id: 5,
      name: "BrightStay PG",
      address: "Near SBSTC Bus Stand, Asansol",
      rent: 7000,
      college: "Asansol Engineering College",
      available: 2,
      gender: "coed",
      status: "few",
      distance: 1.2,
      amenities: ["wifi", "food", "ac", "laundry"],
    },
    {
      id: 6,
      name: "Sunrise Girls PG",
      address: "Hutton Road, Asansol",
      rent: 6500,
      college: "Asansol Engineering College",
      available: 4,
      gender: "girls",
      status: "vacant",
      distance: 3.5,
      amenities: ["wifi", "food", "ac"],
    },
    {
      id: 7,
      name: "Comfort PG",
      address: "Near SBSTC Bus Stand, Asansol",
      rent: 5500,
      college: "Asansol Engineering College",
      available: 0,
      gender: "girls",
      status: "full",
      distance: 1.1,
      amenities: ["wifi", "food"],
    },
  ];

  const amenityIcons = {
    wifi: <Wifi size={14} />,
    food: <UtensilsCrossed size={14} />,
    ac: <Snowflake size={14} />,
    laundry: <Droplet size={14} />,
  };

  // UPDATED: Now uses solid background colors instead of outlines
  const getStatusStyles = (status) => {
    switch (status) {
      case "vacant":
        return { background: GREEN, color: PAPER };
      case "full":
        return { background: "#D94040", color: PAPER };
      case "few":
        return { background: "#D08A00", color: PAPER }; // Solid orange/gold
      default:
        return { background: "#EAE8DF", color: "#6B6A5C" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "vacant": return "Vacant";
      case "full": return "Full";
      case "few": return "Few Left";
      default: return "Unknown";
    }
  };

  // Filter + Sort logic
  const filteredPGs = useMemo(() => {
    let data = [...pgListings];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (pg) =>
          pg.name.toLowerCase().includes(term) ||
          pg.college.toLowerCase().includes(term) ||
          pg.address.toLowerCase().includes(term)
      );
    }

    data = data.filter(
      (pg) => pg.rent >= filters.rentMin && pg.rent <= filters.rentMax
    );

    if (filters.gender !== "all") {
      data = data.filter((pg) => pg.gender === filters.gender);
    }

    data = data.filter((pg) => pg.distance <= filters.distance);

    if (filters.vacancy) {
      data = data.filter(
        (pg) => pg.status === "vacant" || pg.status === "few"
      );
    }

    switch (sortBy) {
      case "Rent (Low→High)":
        data.sort((a, b) => a.rent - b.rent);
        break;
      case "Rent (High→Low)":
        data.sort((a, b) => b.rent - a.rent);
        break;
      case "Distance":
        data.sort((a, b) => a.distance - b.distance);
        break;
      case "Newest":
        data.sort((a, b) => b.id - a.id);
        break;
      default: break;
    }

    return data;
  }, [pgListings, searchTerm, filters, sortBy]);

  return (
    <div className="min-h-screen antialiased pt-28 pb-24 overflow-x-hidden" style={{ background: PAPER, color: INK }}>
      <style>{`
        ::selection { background: ${GREEN}; color: ${PAPER}; }
        .ff-display { font-family: var(--font-display); font-optical-sizing: auto; }
        .ff-mono { font-family: var(--font-mono); }
        .grain {
          background-image: radial-gradient(${GREEN}14 0.5px, transparent 0.5px);
          background-size: 18px 18px;
        }
      `}</style>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        
        {/* ====================== HEADER & SEARCH ====================== */}
        <div className="mb-8">
          <h1 className="ff-display" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1, letterSpacing: "-0.03em", fontWeight: 500 }}>
            Explore <span className="italic text-[#9A9684]" style={{ fontWeight: 400 }}>PGs</span>
          </h1>
          
          <div
            className="mt-6 flex items-center gap-3 w-full p-2"
            style={{ background: PANEL, border: `1px solid ${LINE}` }}
          >
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
            
            {/* Vacancy Toggle (Desktop: right side of header, Mobile: integrated below) */}
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
                min="5000"
                max="20000"
                step="500"
                value={filters.rentMax}
                onChange={(e) => setFilters({ ...filters, rentMax: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: GREEN }}
              />
            </div>

            {/* Distance Filter */}
            <div className="w-full">
              <label className="flex justify-between items-center ff-mono tracking-[0.05em] mb-3" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>
                <span>Distance</span>
                <span style={{ color: INK }}>Up to {filters.distance} km</span>
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={filters.distance}
                onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
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
                <option>Distance</option>
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
            Showing {filteredPGs.length} stays
          </div>

          {/* Grid / Map Toggle */}
          <div className="flex items-center p-1" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
            <button
              onClick={() => setView("grid")}
              className="flex items-center gap-2 px-4 py-2 ff-mono uppercase tracking-[0.1em] transition-colors"
              style={{
                fontSize: "0.65rem",
                background: view === "grid" ? INK : "transparent",
                color: view === "grid" ? PAPER : "#6B6A5C",
              }}
            >
              <LayoutGrid size={14} />
              Grid
            </button>
            <button
              onClick={() => setView("map")}
              className="flex items-center gap-2 px-4 py-2 ff-mono uppercase tracking-[0.1em] transition-colors"
              style={{
                fontSize: "0.65rem",
                background: view === "map" ? INK : "transparent",
                color: view === "map" ? PAPER : "#6B6A5C",
              }}
            >
              <MapIcon size={14} />
              Map
            </button>
          </div>
        </div>

        {/* Content View */}
        {filteredPGs.length === 0 ? (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center border-dashed" style={{ border: `1px dashed ${LINE}`, background: PANEL }}>
            <img src="/p3.svg" alt="No matches found" height="100" width="100" />
            <span className="ff-display" style={{ fontSize: "2rem", color: "#9A9684" }}>No matches found</span>
            <p className="mt-2 ff-mono uppercase tracking-[0.1em]" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : view === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPGs.map((pg) => (
              <div
                key={pg.id}
                className="group flex flex-col transition-colors"
                style={{ background: PANEL, border: `1px solid ${LINE}` }}
              >
                {/* Card Image Placeholder */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAE8DF]" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <img
                    src={`/pg-room-${pg.id}.jpg`}
                    alt={pg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none' }} // Fallback if no image
                  />
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm ff-mono uppercase tracking-[0.1em]" style={{ fontSize: "0.6rem", color: INK }}>
                      {pg.gender}
                    </span>
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
                        <span className="truncate">{pg.address}</span>
                      </div>
                    </div>
                    {/* UPDATED: Solid Badge */}
                    <span 
                      className="px-2.5 py-1.5 ff-mono uppercase tracking-[0.1em] whitespace-nowrap shrink-0" 
                      style={{ fontSize: "0.6rem", ...getStatusStyles(pg.status) }}
                    >
                      {getStatusText(pg.status)}
                    </span>
                  </div>

                  <div className="mt-4 pb-4" style={{ borderBottom: `1px solid ${LINE}` }}>
                    <div className="flex items-end gap-1">
                      <span className="ff-display" style={{ fontSize: "1.8rem", fontWeight: 500, lineHeight: 1 }}>₹{pg.rent}</span>
                      <span className="mb-1" style={{ fontSize: "0.85rem", color: "#6B6A5C" }}>/mo</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2" style={{ color: "#54533F", fontSize: "0.85rem" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: LINE }} />
                      {pg.distance} km from {pg.college}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pg.amenities.map((amenity) => (
                        <span 
                          key={amenity} 
                          className="flex items-center justify-center p-2 rounded-sm"
                          style={{ border: `1px solid ${LINE}`, color: "#6B6A5C", background: PAPER }}
                          title={amenity}
                        >
                          {amenityIcons[amenity]}
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
        ) : (
          /* Map View Placeholder */
          <div className="w-full h-[600px] flex flex-col items-center justify-center grain relative" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
            <MapIcon size={48} style={{ color: GREEN, opacity: 0.5 }} className="mb-4" />
            <p className="mt-2 ff-mono uppercase tracking-[0.1em] text-center max-w-sm px-4" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>
              Google Map integration
            </p>
          </div>
        )}
      </div>
    </div>
  );
}