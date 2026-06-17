"use client";

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Pencil, Trash2, Eye, Plus } from "lucide-react";
import { useAuth } from "../src/lib/auth.jsx";
import { pgApi, ApiError } from "../src/lib/api.js";

export default function MyListings() {
  const navigate = useNavigate();
  const { isAuthenticated, isOwner } = useAuth();

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    pgApi
      .mine()
      .then((data) => {
        setPgs(data);
        setError("");
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not reach the server. Is the backend running?"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner, load]);

  const handleDelete = async (pg) => {
    if (!window.confirm(`Delete "${pg.name}"? This can't be undone.`)) return;
    setDeletingId(pg.id);
    try {
      await pgApi.remove(pg.id);
      setPgs((prev) => prev.filter((p) => p.id !== pg.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete the listing.");
    } finally {
      setDeletingId(null);
    }
  };

  // Auth gate: owners only
  if (!isAuthenticated || !isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Owners only</h2>
          <p className="text-gray-400 mb-6">
            {isAuthenticated
              ? "Your account isn't a PG Owner account."
              : "Please log in as a PG Owner to manage listings."}
          </p>
          <Link
            to="/login"
            className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition font-semibold"
          >
            {isAuthenticated ? "Switch account" : "Login / Sign up"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#FFFEF9] py-12 px-4 md:px-10 lg:px-16">
      <div className="w-full space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-[#191919]">My Listings</h1>
          <Link
            to="/add-pg"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#87E64B] text-black rounded-lg font-semibold no-underline"
          >
            <Plus size={18} /> Add New PG
          </Link>
        </div>

        {loading && <p className="text-gray-500 text-lg">Loading your listings…</p>}
        {!loading && error && <p className="text-red-500 text-lg">{error}</p>}

        {!loading && !error && pgs.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-500 text-lg mb-4">You haven't listed any PGs yet.</p>
            <Link
              to="/add-pg"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#87E64B] text-black rounded-lg font-semibold no-underline"
            >
              <Plus size={18} /> List your first PG
            </Link>
          </div>
        )}

        {!loading && !error && pgs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pgs.map((pg) => (
              <div
                key={pg.id}
                className="bg-[#191919] rounded-xl overflow-hidden shadow-md border border-gray-800"
              >
                <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                  <Home className="w-10 h-10 text-gray-600" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white">{pg.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{pg.address}</p>
                  {pg.frozen && (
                    <p className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded px-2 py-1 mb-3 inline-block">
                      Pending review — not public yet
                    </p>
                  )}
                  <p className="text-[#87E64B] font-bold mb-4">₹{pg.rentSingle}/month</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-pg/${pg.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#87E64B] text-black rounded-lg text-sm font-semibold"
                    >
                      <Pencil size={15} /> Edit
                    </button>
                    <button
                      onClick={() => navigate(`/pg/${pg.id}`)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-600 text-white rounded-lg text-sm"
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(pg)}
                      disabled={deletingId === pg.id}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-red-700 text-red-400 rounded-lg text-sm disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
