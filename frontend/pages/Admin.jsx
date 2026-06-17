"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldOff, Trash2, Eye, EyeOff, Snowflake } from "lucide-react";
import { useAuth } from "../src/lib/auth.jsx";
import { adminApi, ApiError } from "../src/lib/api.js";

export default function Admin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [frozen, setFrozen] = useState(false);
  const [freezeBusy, setFreezeBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.listPGs(), adminApi.getSettings()])
      .then(([data, settings]) => {
        setPgs(data);
        setFrozen(Boolean(settings.uploadsFrozen));
        setError("");
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load listings.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const toggleVerify = async (pg) => {
    setBusyId(pg.id);
    try {
      await adminApi.verify(pg.id, !pg.verified);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (pg) => {
    if (!window.confirm(`Delete "${pg.name}"? This cannot be undone.`)) return;
    setBusyId(pg.id);
    try {
      await adminApi.remove(pg.id);
      setPgs((list) => list.filter((p) => p.id !== pg.id));
    } finally {
      setBusyId(null);
    }
  };

  const toggleHide = async (pg) => {
    setBusyId(pg.id);
    try {
      await adminApi.setHidden(pg.id, !pg.hidden);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const toggleFreeze = async () => {
    setFreezeBusy(true);
    try {
      await adminApi.setUploadsFrozen(!frozen);
      load();
    } finally {
      setFreezeBusy(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Admins only</h2>
          <p className="text-gray-400 mb-6">Log in with an admin account to manage listings.</p>
          <Link to="/login" className="px-6 py-2 bg-[#87E64B] text-black rounded-lg font-semibold">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#FFFEF9] py-12 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#191919] mb-2">Admin · Manage Listings</h1>
        <p className="text-gray-600 mb-6">Verify trustworthy PGs, hide ones that break the rules, or freeze new uploads.</p>

        {/* Freeze new uploads */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={toggleFreeze}
            disabled={freezeBusy}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 ${
              frozen ? "bg-yellow-400 text-black" : "bg-[#191919] text-white border border-gray-700"
            }`}
          >
            <Snowflake size={15} />
            {frozen ? "Freeze: ON" : "Freeze new uploads: OFF"}
          </button>
          <span className="text-sm text-gray-600">
            {frozen
              ? "New uploads are held (hidden) until you turn this off."
              : "New uploads go live immediately."}
          </span>
        </div>

        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-[#191919] rounded-xl border border-gray-800">
            <table className="w-full text-left">
              <thead className="text-gray-400 text-sm border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3">PG</th>
                  <th className="px-4 py-3">Rent</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pgs.map((pg) => (
                  <tr key={pg.id} className="border-b border-gray-800 text-gray-200">
                    <td className="px-4 py-3">
                      {pg.hidden || pg.frozen ? (
                        <span className="text-white font-medium">{pg.name}</span>
                      ) : (
                        <Link to={`/pg/${pg.id}`} className="text-white hover:text-[#87E64B] font-medium no-underline">
                          {pg.name}
                        </Link>
                      )}
                      <p className="text-xs text-gray-500">{pg.address}</p>
                    </td>
                    <td className="px-4 py-3">₹{pg.rentSingle}</td>
                    <td className="px-4 py-3 text-sm">{pg.nearbyCollege || "—"}</td>
                    <td className="px-4 py-3 text-sm">
                      {pg.avgRating != null ? `★ ${pg.avgRating.toFixed(1)} (${pg.reviewCount || 0})` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-0.5">
                        {pg.verified && <span className="text-[#87E64B] font-semibold">Verified</span>}
                        {pg.hidden && <span className="text-red-400 font-semibold">Hidden</span>}
                        {pg.frozen && <span className="text-yellow-400 font-semibold">Frozen (new)</span>}
                        {!pg.verified && !pg.hidden && !pg.frozen && <span className="text-gray-500">Live</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleVerify(pg)}
                          disabled={busyId === pg.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#87E64B] text-black disabled:opacity-60"
                        >
                          {pg.verified ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          {pg.verified ? "Unverify" : "Verify"}
                        </button>
                        <button
                          onClick={() => toggleHide(pg)}
                          disabled={busyId === pg.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-600 text-white hover:bg-gray-800 disabled:opacity-60"
                        >
                          {pg.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                          {pg.hidden ? "Show" : "Hide"}
                        </button>
                        <button
                          onClick={() => remove(pg)}
                          disabled={busyId === pg.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-700 text-red-400 hover:bg-red-950 disabled:opacity-60"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pgs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No listings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
