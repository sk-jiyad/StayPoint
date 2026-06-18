"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldOff, Trash2, Eye, EyeOff, Snowflake, Star } from "lucide-react";
import { useAuth } from "../src/lib/auth.jsx";
import { adminApi, ApiError } from "../src/lib/api.js";

const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LINE = "rgba(21,23,15,0.12)";

export default function Admin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [pgs, setPgs] = useState([]);
  const [frozen, setFrozen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [freezeBusy, setFreezeBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.listPGs(), adminApi.getSettings()])
      .then(([data, settings]) => { setPgs(data); setFrozen(Boolean(settings.uploadsFrozen)); setError(""); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load listings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const toggleVerify = async (pg) => { setBusyId(pg.id); try { await adminApi.verify(pg.id, !pg.verified); load(); } finally { setBusyId(null); } };
  const toggleHide = async (pg) => { setBusyId(pg.id); try { await adminApi.setHidden(pg.id, !pg.hidden); load(); } finally { setBusyId(null); } };
  const remove = async (pg) => {
    if (!window.confirm(`Delete "${pg.name}"? This can't be undone.`)) return;
    setBusyId(pg.id);
    try { await adminApi.remove(pg.id); setPgs((l) => l.filter((p) => p.id !== pg.id)); } finally { setBusyId(null); }
  };
  const toggleFreeze = async () => { setFreezeBusy(true); try { await adminApi.setUploadsFrozen(!frozen); load(); } finally { setFreezeBusy(false); } };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-28" style={{ background: PAPER, color: INK }}>
        <div className="text-center max-w-md p-10" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
          <h2 className="ff-display text-3xl mb-3">Admins only</h2>
          <p className="text-[#6B6A5C] text-sm mb-7">Log in with an admin account to manage listings.</p>
          <Link to="/login" className="inline-block px-6 py-3 ff-mono uppercase text-[0.75rem]" style={{ background: INK, color: PAPER }}>Login</Link>
        </div>
      </div>
    );
  }

  const cellStatus = (pg) => {
    const tags = [];
    if (pg.verified) tags.push(["Verified", GREEN]);
    if (pg.hidden) tags.push(["Hidden", "#D94040"]);
    if (pg.frozen) tags.push(["Frozen", "#D08A00"]);
    if (tags.length === 0) tags.push(["Live", "#6B6A5C"]);
    return tags;
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-10" style={{ background: PAPER, color: INK }}>
      <style>{`.ff-display{font-family:var(--font-display)}.ff-mono{font-family:var(--font-mono)}`}</style>
      <div className="max-w-[1200px] mx-auto">
        <p className="ff-mono uppercase tracking-[0.15em] text-[0.7rem] text-[#6B6A5C] mb-2">Moderation</p>
        <h1 className="ff-display text-4xl md:text-5xl mb-6">Manage the board</h1>

        {/* Freeze toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button
            onClick={toggleFreeze}
            disabled={freezeBusy}
            className="inline-flex items-center gap-2 px-5 py-3 ff-mono uppercase tracking-[0.1em] text-[0.7rem] disabled:opacity-60"
            style={frozen ? { background: "#D08A00", color: PAPER } : { background: INK, color: PAPER }}
          >
            <Snowflake size={14} /> {frozen ? "Freeze: ON" : "Freeze new uploads: OFF"}
          </button>
          <span className="ff-mono text-[0.75rem]" style={{ color: "#6B6A5C" }}>
            {frozen ? "New uploads are held (hidden) until you turn this off." : "New uploads go live immediately."}
          </span>
        </div>

        {loading && <p className="ff-mono uppercase tracking-[0.1em] text-[0.75rem] text-[#6B6A5C]">Loading…</p>}
        {error && <p className="ff-mono text-[0.8rem]" style={{ color: "#D94040" }}>{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
            <table className="w-full text-left ff-mono text-[0.8rem] min-w-[760px]">
              <thead>
                <tr style={{ color: "#6B6A5C", borderBottom: `1px solid ${LINE}` }}>
                  <th className="px-4 py-3 font-normal uppercase tracking-[0.1em] text-[0.65rem]">PG</th>
                  <th className="px-4 py-3 font-normal uppercase tracking-[0.1em] text-[0.65rem]">Rent</th>
                  <th className="px-4 py-3 font-normal uppercase tracking-[0.1em] text-[0.65rem]">College</th>
                  <th className="px-4 py-3 font-normal uppercase tracking-[0.1em] text-[0.65rem]">Rating</th>
                  <th className="px-4 py-3 font-normal uppercase tracking-[0.1em] text-[0.65rem]">Status</th>
                  <th className="px-4 py-3 font-normal uppercase tracking-[0.1em] text-[0.65rem] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pgs.map((pg) => (
                  <tr key={pg.id} style={{ borderBottom: `1px solid ${LINE}` }}>
                    <td className="px-4 py-3">
                      {pg.hidden || pg.frozen ? (
                        <span className="ff-display text-base" style={{ color: INK }}>{pg.name}</span>
                      ) : (
                        <Link to={`/pg/${pg.id}`} className="ff-display text-base no-underline" style={{ color: INK }}>{pg.name}</Link>
                      )}
                      <div className="text-[0.7rem] truncate max-w-[220px]" style={{ color: "#9A9684" }}>{pg.address}</div>
                    </td>
                    <td className="px-4 py-3">₹{pg.rentSingle}</td>
                    <td className="px-4 py-3">{pg.nearbyCollege || "—"}</td>
                    <td className="px-4 py-3">
                      {pg.avgRating != null ? (
                        <span className="inline-flex items-center gap-1"><Star size={12} style={{ color: GREEN, fill: GREEN }} /> {pg.avgRating.toFixed(1)} ({pg.reviewCount || 0})</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {cellStatus(pg).map(([label, color]) => (
                          <span key={label} className="uppercase tracking-[0.1em] text-[0.6rem]" style={{ color }}>{label}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleVerify(pg)} disabled={busyId === pg.id} className="inline-flex items-center gap-1 px-3 py-1.5 uppercase text-[0.65rem] disabled:opacity-60" style={{ background: GREEN, color: PAPER }}>
                          {pg.verified ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}{pg.verified ? "Unverify" : "Verify"}
                        </button>
                        <button onClick={() => toggleHide(pg)} disabled={busyId === pg.id} className="inline-flex items-center gap-1 px-3 py-1.5 uppercase text-[0.65rem] border disabled:opacity-60" style={{ borderColor: LINE, color: INK }}>
                          {pg.hidden ? <Eye size={13} /> : <EyeOff size={13} />}{pg.hidden ? "Show" : "Hide"}
                        </button>
                        <button onClick={() => remove(pg)} disabled={busyId === pg.id} className="inline-flex items-center gap-1 px-3 py-1.5 uppercase text-[0.65rem] border disabled:opacity-60" style={{ borderColor: LINE, color: "#D94040" }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pgs.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: "#6B6A5C" }}>No listings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
