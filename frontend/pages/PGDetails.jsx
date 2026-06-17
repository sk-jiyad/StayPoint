"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Phone, MessageCircle, MapPin, 
  ChevronLeft, ChevronRight, Star, ShieldCheck, Check 
} from "lucide-react";
import { pgListings } from "../src/data/pgdata";

const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LIME = "#C7F04A";
const LINE = "rgba(21,23,15,0.12)";

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  
  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState(pgListings.find(p => p.id === Number(id))?.reviewsList || []);

  const pg = pgListings.find((p) => p.id === Number(id));

  if (!pg) return <div className="text-center py-20">Listing not found.</div>;

  const currentPrice = pg.sharingOptions?.[activeTab]?.rent || pg.rent;

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!comment) return;
    const newReview = { user: "Student User", rating, text: comment, date: "Just now" };
    setReviews([newReview, ...reviews]);
    setComment("");
    setRating(5);
  };

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
            <img src={pg.images[currentImage]} alt={pg.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-6 right-6 flex gap-2">
              <button onClick={() => setCurrentImage((p) => (p === 0 ? pg.images.length - 1 : p - 1))} className="p-3 bg-white/80 hover:bg-white"><ChevronLeft size={18}/></button>
              <button onClick={() => setCurrentImage((p) => (p + 1) % pg.images.length)} className="p-3 bg-white/80 hover:bg-white"><ChevronRight size={18}/></button>
            </div>
          </div>

          {/* Title & Meta Data */}
          <div className="space-y-6">
            <h1 className="ff-display text-5xl md:text-6xl">{pg.name}</h1>
            <div className="flex flex-wrap gap-6 ff-mono text-[0.75rem] uppercase tracking-[0.15em] border-y py-6" style={{ borderColor: LINE }}>
              <span className="flex items-center gap-2"><MapPin size={16} /> {pg.address}</span>
              <span className="flex items-center gap-2" style={{ color: GREEN }}><Star size={16} className="fill-current" /> {pg.rating} Stars</span>
            </div>
          </div>

          {/* Room Type Boxes */}
          <div>
            <h3 className="ff-display text-2xl mb-6">Select Room Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pg.sharingOptions.map((opt, idx) => (
                <button
                  key={idx}
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

          {/* Description & Amenities */}
          <div className="space-y-10">
            <div>
              <h3 className="ff-display text-2xl mb-4">Property Overview</h3>
              <p className="leading-relaxed text-[#54533F]">{pg.description}</p>
            </div>
            <div>
              <h3 className="ff-display text-2xl mb-6">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pg.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 p-4 border border-[#DBD9CE] ff-mono text-sm">
                    <ShieldCheck size={18} style={{ color: GREEN }} /> {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="pt-10 border-t" style={{ borderColor: LINE }}>
            <h3 className="ff-display text-2xl mb-8">Write a Review</h3>
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
              <button type="submit" className="px-6 py-3 ff-mono uppercase text-[0.75rem]" style={{ background: INK, color: PAPER }}>Post Review</button>
            </form>

            <div className="space-y-6">
              {reviews.map((r, i) => (
                <div key={i} className="pb-6 border-b" style={{ borderColor: LINE }}>
                  <div className="flex justify-between mb-2"><span className="font-bold">{r.user}</span><span className="ff-mono text-[0.7rem]">{r.date}</span></div>
                  <div className="flex gap-1 mb-2">{[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="fill-[#C7F04A] text-[#4F7B1E]" />)}</div>
                  <p className="text-[#54533F]">{r.text}</p>
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
              <div className="ff-display text-3xl mt-2">{pg.sharingOptions[activeTab].type} Sharing</div>
              <div className="ff-display text-5xl mt-2" style={{ color: LIME }}>₹{currentPrice}</div>
            </div>
            <div className="space-y-4">
              <a href={`tel:${pg.ownerPhone}`} className="w-full flex items-center justify-center gap-3 py-4 ff-mono uppercase tracking-[0.15em] text-sm" style={{ background: LIME, color: INK }}>
                <Phone size={16} /> Call Owner
              </a>
              <a href={`https://wa.me/91${pg.ownerPhone}`} target="_blank" className="w-full flex items-center justify-center gap-3 py-4 ff-mono uppercase tracking-[0.15em] border text-sm" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}