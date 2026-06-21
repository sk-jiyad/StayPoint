"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Trash2, Edit2, Eye, ShieldCheck } from "lucide-react";
import { useAuth } from "../src/lib/auth.jsx";
import { pgApi, ApiError } from "../src/lib/api.js";

const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LINE = "rgba(21,23,15,0.12)";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isOwner, user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    pgApi
      .mine()
      .then((data) => { setProperties(data); setError(""); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not reach the server. Is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner]);

  const deleteProperty = async (pg) => {
    if (!window.confirm(`Delete "${pg.name}"? This can't be undone.`)) return;
    setBusyId(pg.id);
    try {
      await pgApi.remove(pg.id);
      setProperties((prev) => prev.filter((p) => p.id !== pg.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete the listing.");
    } finally {
      setBusyId(null);
    }
  };

  // Auth gate
  if (!isAuthenticated || !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: PAPER, color: INK }}>
        <div className="text-center max-w-md p-10" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
          <h2 className="ff-display text-3xl mb-3">Owners only</h2>
          <p className="text-[#6B6A5C] text-sm mb-7">
            {isAuthenticated ? "Your account isn't a PG-owner account." : "Log in as a PG owner to manage your listings."}
          </p>
          <Link to="/login" className="inline-block px-6 py-3 ff-mono uppercase text-[0.75rem]" style={{ background: INK, color: PAPER }}>
            {isAuthenticated ? "Switch account" : "Login / Sign up"}
          </Link>
        </div>
      </div>
    );
  }

  const roomsAvailable = properties.reduce((acc, pg) => acc + (pg.availableRooms || 0), 0);

  return (
    <div className="min-h-screen pt-28 pb-16 md:pb-24 px-4 md:px-10 grain" style={{ background: PAPER, color: INK }}>
      <style>{`
        .ff-display { font-family: var(--font-display); }
        .ff-mono { font-family: var(--font-mono); }
        .grain { background-image: radial-gradient(${GREEN}14 0.5px, transparent 0.5px); background-size: 18px 18px; }
      `}</style>

      <div className="max-w-[1200px] mx-auto pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
          <div>
            <p className="ff-mono uppercase tracking-[0.15em] text-[0.7rem] text-[#6B6A5C] mb-2">Welcome back,</p>
            <h1 className="ff-display text-4xl md:text-5xl">{user?.email?.split("@")[0] || "Owner"}</h1>
          </div>
          <button
            onClick={() => navigate("/add-pg")}
            className="flex items-center justify-center gap-3 px-6 py-3.5 ff-mono uppercase text-[0.75rem] transition-opacity hover:opacity-90 w-full md:w-auto"
            style={{ background: INK, color: PAPER }}
          >
            <Plus size={16} /> List New PG
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12">
          <div className="p-6 md:p-8" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
            <p className="ff-mono uppercase text-[0.65rem] opacity-60 mb-2">Active Listings</p>
            <div className="ff-display text-3xl md:text-4xl">{properties.length}</div>
          </div>
          <div className="p-6 md:p-8" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
            <p className="ff-mono uppercase text-[0.65rem] opacity-60 mb-2">Rooms Available</p>
            <div className="ff-display text-3xl md:text-4xl text-[#4F7B1E]">{roomsAvailable}</div>
          </div>
        </div>

        {/* States */}
        {loading && <p className="ff-mono uppercase tracking-[0.1em] text-[0.75rem] text-[#6B6A5C]">Loading your listings…</p>}
        {!loading && error && <p className="ff-mono text-[0.8rem]" style={{ color: "#D94040" }}>{error}</p>}

        {!loading && !error && properties.length === 0 && (
          <div className="p-10 text-center" style={{ border: `1px dashed ${LINE}`, background: PANEL }}>
            <p className="ff-display text-2xl mb-3" style={{ color: "#9A9684" }}>No listings yet</p>
            <Link to="/add-pg" className="inline-flex items-center gap-2 px-5 py-3 ff-mono uppercase text-[0.7rem]" style={{ background: INK, color: PAPER }}>
              <Plus size={14} /> List your first PG
            </Link>
          </div>
        )}

        {/* Listings */}
        {!loading && !error && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((pg) => (
              <div key={pg.id} className="p-6 flex flex-col" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="ff-display text-2xl">{pg.name}</h2>
                  {pg.verified && <ShieldCheck size={18} style={{ color: GREEN }} title="Verified" className="shrink-0 mt-1" />}
                </div>
                <p className="ff-mono text-[0.7rem] uppercase text-[#6B6A5C] mb-2 line-clamp-1">{pg.address}{pg.city ? `, ${pg.city}` : ""}</p>

                {pg.frozen && (
                  <span className="self-start mb-3 px-2 py-1 ff-mono text-[0.6rem] uppercase tracking-[0.1em]" style={{ background: "#D08A00", color: PAPER }}>
                    Pending review — not public yet
                  </span>
                )}

                <div className="flex items-center gap-3 text-[0.8rem] text-[#54533F] mb-5">
                  <span className="ff-display text-2xl text-[#15170F]">₹{pg.rentSingle}</span>
                  <span className="opacity-70">/mo</span>
                  {pg.availableRooms != null && (
                    <span className="ml-auto px-2 py-1 rounded-sm ff-mono text-[0.6rem] uppercase bg-[#EAE8DF] text-[#6B6A5C]">
                      {pg.availableRooms} bed{pg.availableRooms === 1 ? "" : "s"} left
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link to={`/pg/${pg.id}`} className="p-2.5 border hover:bg-gray-100" style={{ borderColor: LINE }} title="Preview"><Eye size={16} /></Link>
                  <button onClick={() => navigate(`/edit-pg/${pg.id}`)} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 ff-mono uppercase text-[0.7rem]" style={{ background: INK, color: PAPER }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => deleteProperty(pg)} disabled={busyId === pg.id} className="p-2.5 border hover:bg-red-50 text-red-500 disabled:opacity-50" style={{ borderColor: LINE }} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
