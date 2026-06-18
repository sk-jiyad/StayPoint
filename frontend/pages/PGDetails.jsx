"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, MessageCircle, MapPin,
  ChevronLeft, ChevronRight, Star, ShieldCheck, Check, ImageOff,
} from "lucide-react";
import { pgApi, reviewApi, ApiError } from "../src/lib/api.js";
import { rentTiers, amenityList } from "../src/lib/pgView.js";
import { useAuth } from "../src/lib/auth.jsx";

const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LIME = "#C7F04A";
const LINE = "rgba(21,23,15,0.12)";

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);

  const loadReviews = () => reviewApi.list(id).then(setReviews).catch(() => setReviews([]));

  useEffect(() => {
    let active = true;
    setLoading(true);
    pgApi
      .get(id)
      .then((data) => active && (setPg(data), setError("")))
      .catch((err) => {
        if (!active) return;
        setError(err instanceof ApiError && err.status === 404 ? "Listing not found." : "Could not load this PG.");
      })
      .finally(() => active && setLoading(false));
    loadReviews();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSaving(true);
    try {
      await reviewApi.create(id, { rating: Number(rating), comment });
      setComment("");
      setRating(5);
      await loadReviews();
      setPg(await pgApi.get(id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setReviewError("Please log in to leave a review.");
      else if (err instanceof ApiError && err.status === 403) setReviewError("You can't review your own listing.");
      else setReviewError(err.message || "Could not submit review.");
    } finally {
      setReviewSaving(false);
    }
  };

  if (loading) return <div className="text-center py-32 ff-mono uppercase tracking-[0.1em] text-[0.75rem]" style={{ color: "#6B6A5C" }}>Loading…</div>;
  if (error || !pg) return <div className="text-center py-32 ff-display text-3xl" style={{ color: "#9A9684" }}>{error || "Listing not found."}</div>;

  const images = pg.imageUrls || [];
  const tiers = rentTiers(pg);
  const amenities = amenityList(pg);
  const currentPrice = tiers[activeTab]?.rent ?? pg.rentSingle;

  return (
    <div className="min-h-screen py-10 px-6 md:px-10" style={{ background: PAPER, color: INK }}>
      <style>{`
        .ff-display { font-family: var(--font-display); }
        .ff-mono { font-family: var(--font-mono); }
      `}</style>

      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-12 gap-12">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-8 space-y-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 ff-mono uppercase tracking-[0.1em] text-[0.7rem] hover:opacity-70 transition-opacity cursor-pointer">
            <ArrowLeft size={16} /> Back to listings
          </button>

          {/* Hero Gallery */}
          <div className="relative aspect-[16/9] overflow-hidden bg-[#EAE8DF]" style={{ border: `1px solid ${LINE}` }}>
            {images.length > 0 ? (
              <img src={images[currentImage]} alt={pg.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-content-center text-center" style={{ color: "#9A9684" }}>
                <ImageOff size={32} className="mx-auto mb-2" />
                <span className="ff-mono uppercase tracking-[0.1em] text-[0.7rem]">No photos yet</span>
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-6 right-6 flex gap-2">
                <button onClick={() => setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1))} className="p-3 bg-white/80 hover:bg-white"><ChevronLeft size={18} /></button>
                <button onClick={() => setCurrentImage((p) => (p + 1) % images.length)} className="p-3 bg-white/80 hover:bg-white"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>

          {/* Title & Meta Data */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="ff-display text-5xl md:text-6xl">{pg.name}</h1>
              {pg.verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 ff-mono uppercase tracking-[0.15em] text-[0.65rem]" style={{ background: GREEN, color: PAPER }}>
                  <ShieldCheck size={13} /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-6 ff-mono text-[0.75rem] uppercase tracking-[0.15em] border-y py-6" style={{ borderColor: LINE }}>
              <span className="flex items-center gap-2"><MapPin size={16} /> {pg.address}{pg.city ? `, ${pg.city}` : ""}</span>
              {pg.avgRating != null && (
                <span className="flex items-center gap-2" style={{ color: GREEN }}>
                  <Star size={16} className="fill-current" /> {pg.avgRating.toFixed(1)} · {pg.reviewCount || 0} reviews
                </span>
              )}
              {pg.nearbyCollege && <span className="flex items-center gap-2">Near {pg.nearbyCollege}</span>}
            </div>
          </div>

          {/* Room Type Boxes */}
          {tiers.length > 0 && (
            <div>
              <h3 className="ff-display text-2xl mb-6">Select Room Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((opt, idx) => (
                  <button
                    key={opt.type}
                    onClick={() => setActiveTab(idx)}
                    className={`p-6 text-left border transition-all duration-200 ${activeTab === idx ? "border-[2px]" : "border-[1px]"}`}
                    style={{ borderColor: activeTab === idx ? GREEN : LINE, background: activeTab === idx ? PANEL : PAPER }}
                  >
                    <div className="ff-mono text-[0.7rem] uppercase tracking-[0.2em] mb-2 opacity-70">{opt.type} Sharing</div>
                    <div className="ff-display text-3xl">₹{opt.rent} <span className="text-[0.8rem] font-sans opacity-60 ml-1">/mo</span></div>
                    {activeTab === idx && <div className="mt-4 flex items-center gap-2 text-[0.7rem] ff-mono uppercase" style={{ color: GREEN }}><Check size={14} /> Selected</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          <div>
            <h3 className="ff-display text-2xl mb-6">Amenities</h3>
            {amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((a) => (
                  <div key={a.key} className="flex items-center gap-3 p-4 border border-[#DBD9CE] ff-mono text-sm">
                    <ShieldCheck size={18} style={{ color: GREEN }} /> {a.label}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#6B6A5C] text-sm">No amenities listed — ask the owner when you call.</p>
            )}
          </div>

          {/* Reviews Section */}
          <div className="pt-10 border-t" style={{ borderColor: LINE }}>
            <h3 className="ff-display text-2xl mb-8">
              Reviews {reviews.length > 0 && <span className="text-[#9A9684] text-xl">({reviews.length})</span>}
            </h3>

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="p-6 mb-10" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={24} className={`cursor-pointer ${s <= rating ? "fill-[#C7F04A] text-[#4F7B1E]" : "text-gray-300"}`} onClick={() => setRating(s)} />
                  ))}
                </div>
                <textarea
                  className="w-full p-4 mb-4 outline-none" style={{ background: PAPER, border: `1px solid ${LINE}` }}
                  placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)}
                />
                {reviewError && <p className="ff-mono text-[0.75rem] mb-3" style={{ color: "#D94040" }}>{reviewError}</p>}
                <button type="submit" disabled={reviewSaving} className="px-6 py-3 ff-mono uppercase text-[0.75rem] disabled:opacity-60" style={{ background: INK, color: PAPER }}>
                  {reviewSaving ? "Posting…" : "Post Review"}
                </button>
              </form>
            ) : (
              <p className="ff-mono text-[0.8rem] mb-10" style={{ color: "#6B6A5C" }}>Log in to leave a review.</p>
            )}

            <div className="space-y-6">
              {reviews.length === 0 && <p className="text-[#6B6A5C]">No reviews yet. Be the first.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="pb-6 border-b" style={{ borderColor: LINE }}>
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">{r.authorName}</span>
                    <span className="ff-mono text-[0.7rem]" style={{ color: "#9A9684" }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-2">{[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="fill-[#C7F04A] text-[#4F7B1E]" />)}</div>
                  {r.comment && <p className="text-[#54533F]">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (Right Column) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 p-8" style={{ background: INK, color: PAPER }}>
            <div className="mb-8">
              <span className="ff-mono text-[0.65rem] uppercase tracking-[0.2em] opacity-60">Selected Plan</span>
              <div className="ff-display text-3xl mt-2">{tiers[activeTab]?.type ?? "Single"} Sharing</div>
              <div className="ff-display text-5xl mt-2" style={{ color: LIME }}>₹{currentPrice}</div>
            </div>
            <div className="mb-6">
              <span className="ff-mono text-[0.65rem] uppercase tracking-[0.2em] opacity-60">Owner</span>
              <div className="text-lg mt-1">{pg.ownerName}</div>
            </div>
            <div className="space-y-4">
              <a href={`tel:${pg.contactNumber}`} className="w-full flex items-center justify-center gap-3 py-4 ff-mono uppercase tracking-[0.15em] text-sm" style={{ background: LIME, color: INK }}>
                <Phone size={16} /> Call Owner
              </a>
              <a href={`https://wa.me/91${pg.contactNumber}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-3 py-4 ff-mono uppercase tracking-[0.15em] border text-sm" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
