"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  MapPin,
  ArrowLeft,
  Bookmark,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { pgApi, ApiError } from "../src/lib/api.js";

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    pgApi
      .get(id)
      .then((data) => active && (setPg(data), setError("")))
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) setError("PG not found");
        else setError("Could not load this PG. Is the backend running?");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="text-gray-600 text-center mt-20 text-xl">Loading…</div>;
  }

  if (error || !pg) {
    return <div className="text-gray-700 text-center mt-20 text-xl">{error || "PG not found"}</div>;
  }

  const images = pg.imageUrls || [];

  const amenities = [];
  if (pg.wifiAvailable) amenities.push("WiFi");
  if (pg.foodProvided) amenities.push("Food");
  if (pg.acAvailable) amenities.push("AC");

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#383838] font-semibold"
        >
          <ArrowLeft size={18} />
          Back to listings
        </button>

        {/* Photos */}
        <div className="relative rounded-xl overflow-hidden">
          {images.length > 0 ? (
            <img
              src={images[currentImage]}
              alt={pg.name}
              className="w-full h-[400px] object-cover"
            />
          ) : (
            <div className="w-full h-[400px] bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
              <Home className="w-20 h-20 text-gray-600" />
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full"
              >
                <ChevronLeft className="text-white" />
              </button>
              <button
                onClick={() => setCurrentImage((i) => (i + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full"
              >
                <ChevronRight className="text-white" />
              </button>
            </>
          )}

          <button
            onClick={() => setSaved(!saved)}
            className="absolute top-4 right-4 bg-black/70 p-2 rounded-full"
          >
            <Bookmark
              className={saved ? "text-[#87E64B] fill-[#87E64B]" : "text-white"}
            />
          </button>
        </div>

        {/* Header Info */}
        <div className="bg-[#191919] rounded-xl p-6">
          <div className="flex justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{pg.name}</h1>
              <p className="text-gray-400 flex items-center gap-1 mt-1">
                <MapPin size={16} /> {pg.address}
              </p>
              {pg.landmark && (
                <p className="text-[#87E64B] mt-2 flex items-center gap-1">
                  <MapPin size={16} /> Near {pg.landmark}
                </p>
              )}
              {(pg.gender || pg.availableRooms != null) && (
                <div className="flex gap-3 mt-2 text-sm text-gray-300">
                  {pg.gender && <span className="capitalize">For {pg.gender}</span>}
                  {pg.availableRooms != null && <span>· {pg.availableRooms} rooms available</span>}
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-[#87E64B]">₹{pg.rentSingle}</p>
              <p className="text-gray-400">/month (single)</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rent tiers */}
            <div className="bg-[#191919] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-3">Rent</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-800 rounded-lg py-3">
                  <p className="text-gray-400 text-sm">Single</p>
                  <p className="text-white font-semibold">₹{pg.rentSingle}</p>
                </div>
                <div className="bg-gray-800 rounded-lg py-3">
                  <p className="text-gray-400 text-sm">Double</p>
                  <p className="text-white font-semibold">₹{pg.rentDouble}</p>
                </div>
                <div className="bg-gray-800 rounded-lg py-3">
                  <p className="text-gray-400 text-sm">Triple</p>
                  <p className="text-white font-semibold">
                    {pg.rentTriple != null ? `₹${pg.rentTriple}` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-[#191919] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Amenities</h2>
              {amenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#87E64B]">✔</span> {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No amenities listed.</p>
              )}
            </div>
          </div>

          {/* RIGHT - CONTACT */}
          <div className="bg-[#191919] rounded-xl p-6 h-fit sticky top-20">
            <h3 className="text-xl font-bold text-white mb-4">Contact Owner</h3>

            <p className="text-gray-300 font-semibold mb-1">{pg.ownerName}</p>
            <p className="text-gray-400 text-sm mb-4">{pg.contactNumber}</p>

            <a
              href={`tel:${pg.contactNumber}`}
              className="w-full flex justify-center items-center gap-2 bg-[#87E64B] text-black py-3 rounded-lg font-semibold mb-3"
            >
              <Phone size={18} />
              Call Owner
            </a>

            <a
              href={`https://wa.me/91${pg.contactNumber}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex justify-center items-center gap-2 border border-[#87E64B] text-[#87E64B] py-3 rounded-lg font-semibold"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>

            {pg.alternateContact && (
              <p className="text-gray-500 text-sm mt-3 text-center">
                Alt: {pg.alternateContact}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
