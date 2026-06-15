"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { useAuth } from "../src/lib/auth.jsx";
import { adminApi, ApiError } from "../src/lib/api.js";

export default function Admin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listPGs()
      .then((data) => {
        setPgs(data);
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
        <p className="text-gray-600 mb-8">Verify trustworthy PGs or remove ones that break the rules.</p>

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
                      <Link to={`/pg/${pg.id}`} className="text-white hover:text-[#87E64B] font-medium no-underline">
                        {pg.name}
                      </Link>
                      <p className="text-xs text-gray-500">{pg.address}</p>
                    </td>
                    <td className="px-4 py-3">₹{pg.rentSingle}</td>
                    <td className="px-4 py-3 text-sm">{pg.nearbyCollege || "—"}</td>
                    <td className="px-4 py-3 text-sm">
                      {pg.avgRating != null ? `★ ${pg.avgRating.toFixed(1)} (${pg.reviewCount || 0})` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {pg.verified ? (
                        <span className="text-[#87E64B] text-sm font-semibold">Verified</span>
                      ) : (
                        <span className="text-gray-500 text-sm">Unverified</span>
                      )}
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
